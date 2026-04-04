import api from './api';

const FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'profile',
  'email',
].join(' ');

// ─────────────────────────────────────────────────────────────
// buildGoogleOAuthUrl
// redirect_uri MUST match exactly what is in Google Cloud Console.
// We always point to /fit-callback — never just the origin.
// ─────────────────────────────────────────────────────────────
export const buildGoogleOAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // This MUST match your Google Console authorized redirect URI exactly:
  //   Dev:  http://localhost:5173/fit-callback
  //   Prod: https://your-app.vercel.app/fit-callback
  const redirectUri = `${window.location.origin}/fit-callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',       // Implicit flow — token arrives in URL hash
    scope: FIT_SCOPES,
    include_granted_scopes: 'true',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// ─────────────────────────────────────────────────────────────
// extractAccessTokenFromHash
// Called ONLY from FitCallback.jsx — NOT from FitContext.
// Reads window.location.hash, pulls out access_token,
// cleans the URL, returns the token string or null.
// ─────────────────────────────────────────────────────────────
export const extractAccessTokenFromHash = () => {
  const hash = window.location.hash.substring(1); // strip leading '#'
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const token = params.get('access_token');

  if (token) {
    // Remove the hash from the URL so it doesn't persist on refresh
    window.history.replaceState(null, '', window.location.pathname);
  }

  return token || null;
};

// ─────────────────────────────────────────────────────────────
// fetchFitData — sends token to backend, gets health metrics
// ─────────────────────────────────────────────────────────────
export const fetchFitData = async (accessToken) => {
  const res = await api.post('/fit-data', { accessToken });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// fetchCachedFitData — reads last stored data from MongoDB
// ─────────────────────────────────────────────────────────────
export const fetchCachedFitData = async () => {
  const res = await api.get('/fit-data/cached');
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// calculateFitRisk — rule-based risk delta from fitness data
// ─────────────────────────────────────────────────────────────
export const calculateFitRisk = ({ steps = 0, heartRate = 0, sleepHours = 0 }) => {
  let delta = 0;
  const reasons = [];

  if (steps < 2000) {
    delta += 20;
    reasons.push('Critical inactivity — fewer than 2,000 steps');
  } else if (steps < 4000) {
    delta += 10;
    reasons.push('Low step count — below 4,000 steps');
  }

  if (heartRate > 110) {
    delta += 25;
    reasons.push(`Elevated resting heart rate — ${heartRate} bpm`);
  } else if (heartRate > 95) {
    delta += 10;
    reasons.push(`Slightly elevated heart rate — ${heartRate} bpm`);
  }

  if (sleepHours > 0 && sleepHours < 5) {
    delta += 20;
    reasons.push(`Severe sleep deprivation — ${sleepHours} hrs`);
  } else if (sleepHours > 0 && sleepHours < 6) {
    delta += 10;
    reasons.push(`Insufficient sleep — ${sleepHours} hrs`);
  }

  const sosTrigger = heartRate > 130;

  return { delta, reasons, sosTrigger };
};

// ─────────────────────────────────────────────────────────────
// compareRecovery — today vs yesterday step comparison
// ─────────────────────────────────────────────────────────────
export const compareRecovery = (todaySteps, yesterdaySteps) => {
  if (!yesterdaySteps) return { status: 'stable', diff: 0, pct: 0 };
  const diff = todaySteps - yesterdaySteps;
  const pct = yesterdaySteps > 0 ? Math.round((diff / yesterdaySteps) * 100) : 0;

  if (diff > 500) return { status: 'improving', diff, pct };
  if (diff < -500) return { status: 'needs_attention', diff, pct };
  return { status: 'stable', diff, pct };
};