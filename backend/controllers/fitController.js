// backend/controllers/fitController.js
// NEW FILE — handles Google Fit API calls + stores data in MongoDB

const axios = require('axios');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────
// Helper: Build Fitness API request body for aggregate endpoint
// ─────────────────────────────────────────────────────────────
const buildAggregateBody = (dataTypeName, bucketDurationMillis = 86400000) => {
  const now = Date.now();
  const oneDayAgo = now - bucketDurationMillis;
  return {
    aggregateBy: [{ dataTypeName }],
    bucketByTime: { durationMillis: bucketDurationMillis },
    startTimeMillis: oneDayAgo,
    endTimeMillis: now,
  };
};

// ─────────────────────────────────────────────────────────────
// Helper: Extract step count from Fitness API response
// ─────────────────────────────────────────────────────────────
const extractSteps = (data) => {
  try {
    const bucket = data.bucket?.[0];
    const dataset = bucket?.dataset?.[0];
    const point = dataset?.point?.[0];
    return point?.value?.[0]?.intVal ?? 0;
  } catch {
    return 0;
  }
};

// ─────────────────────────────────────────────────────────────
// Helper: Extract average heart rate from Fitness API response
// ─────────────────────────────────────────────────────────────
const extractHeartRate = (data) => {
  try {
    const bucket = data.bucket?.[0];
    const dataset = bucket?.dataset?.[0];
    const point = dataset?.point?.[0];
    return Math.round(point?.value?.[0]?.fpVal ?? 0);
  } catch {
    return 0;
  }
};

// ─────────────────────────────────────────────────────────────
// Helper: Extract sleep hours from Fitness API response
// Sleep is stored in minutes as intVal under sleep.segment
// ─────────────────────────────────────────────────────────────
const extractSleep = (data) => {
  try {
    let totalMinutes = 0;
    const buckets = data.bucket ?? [];
    for (const bucket of buckets) {
      const dataset = bucket?.dataset?.[0];
      for (const point of dataset?.point ?? []) {
        // Only count actual sleep stages (not awake = 1)
        const sleepType = point?.value?.[0]?.intVal;
        if (sleepType && sleepType !== 1) {
          const durationMs = point.endTimeNanos / 1e6 - point.startTimeNanos / 1e6;
          totalMinutes += durationMs / 60000;
        }
      }
    }
    return parseFloat((totalMinutes / 60).toFixed(1));
  } catch {
    return 0;
  }
};

// ─────────────────────────────────────────────────────────────
// MOCK DATA — used when Google Fit returns empty (demo mode)
// ─────────────────────────────────────────────────────────────
const getMockFitData = () => ({
  steps: 3500,
  heartRate: 85,
  sleepHours: 6.5,
  source: 'mock',
});

// ─────────────────────────────────────────────────────────────
// POST /api/fit-data
// Body: { accessToken: string }
// Auth: JWT required (protect middleware)
// ─────────────────────────────────────────────────────────────
const getFitData = async (req, res) => {
  const { accessToken } = req.body;
  const userId = req.user._id;

  if (!accessToken) {
    return res.status(400).json({ message: 'accessToken is required' });
  }

  const fitBaseUrl = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    // ── Parallel fetch: steps + heart rate + sleep ─────────
    const [stepsRes, heartRateRes, sleepRes] = await Promise.allSettled([
      axios.post(fitBaseUrl, buildAggregateBody('com.google.step_count.delta'), { headers }),
      axios.post(fitBaseUrl, buildAggregateBody('com.google.heart_rate.bpm'), { headers }),
      axios.post(fitBaseUrl, buildAggregateBody('com.google.sleep.segment'), { headers }),
    ]);

    // ── Extract values (fall back to 0 if API returned error) ─
    const steps = stepsRes.status === 'fulfilled' ? extractSteps(stepsRes.value.data) : 0;
    const heartRate = heartRateRes.status === 'fulfilled' ? extractHeartRate(heartRateRes.value.data) : 0;
    const sleepHours = sleepRes.status === 'fulfilled' ? extractSleep(sleepRes.value.data) : 0;

    // ── If all zeros, return mock data for demo ─────────────
    const allEmpty = steps === 0 && heartRate === 0 && sleepHours === 0;
    const result = allEmpty ? getMockFitData() : { steps, heartRate, sleepHours, source: 'google_fit' };

    // ── Persist to MongoDB (update user's fitData) ──────────
    await User.findByIdAndUpdate(userId, {
      googleAccessToken: accessToken,
      fitData: {
        steps: result.steps,
        heartRate: result.heartRate,
        sleepHours: result.sleepHours,
        lastSynced: new Date(),
      },
    });

    // ── Smart SOS pre-check logic (FUTURE READY — log only) ─
    // DO NOT auto-trigger yet. Just log for future integration.
    if (result.heartRate > 130) {
      console.warn(`[SOS-WATCH] User ${userId} has elevated heart rate: ${result.heartRate} bpm`);
      // TODO (Phase 2): io.to(userId).emit('sos-warning', { reason: 'elevated_heart_rate' });
    }

    return res.json(result);
  } catch (err) {
    // ── On any API failure, return mock data so demo never breaks
    console.error('[FitController] Google Fit API error:', err.message);
    const mock = getMockFitData();

    // Still persist mock so dashboard has something to show
    await User.findByIdAndUpdate(userId, {
      fitData: { steps: mock.steps, heartRate: mock.heartRate, sleepHours: mock.sleepHours, lastSynced: new Date() },
    }).catch(() => {}); // silent — don't block response

    return res.json(mock);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/fit-data/cached
// Returns last synced fit data from MongoDB (no Google call)
// ─────────────────────────────────────────────────────────────
const getCachedFitData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('fitData');
    if (!user?.fitData?.lastSynced) {
      return res.json(getMockFitData()); // No data yet → mock
    }
    return res.json({
      steps: user.fitData.steps,
      heartRate: user.fitData.heartRate,
      sleepHours: user.fitData.sleepHours,
      source: 'cached',
      lastSynced: user.fitData.lastSynced,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getFitData, getCachedFitData };