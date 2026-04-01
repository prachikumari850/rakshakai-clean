const HealthLog = require('../models/HealthLog');
const { calculateRisk } = require('../utils/riskEngine');

// POST /api/health/log — Save today's health entry
const logHealth = async (req, res) => {
  try {
    const { date, heartRate, systolic, diastolic, sugarLevel, steps, sleepHours, mood } = req.body;
    const userId = req.user._id;

    // Generate smart insights from rule-based logic
    const insights = [];
    if (sleepHours < 6) insights.push('⚠️ Sleep deprivation detected. Aim for 7–8 hours.');
    if (steps < 3000) insights.push('🚶 Low activity! Try a 20-minute walk today.');
    if (heartRate > 100) insights.push('❤️ Elevated heart rate. Rest and stay hydrated.');
    if (sugarLevel > 180) insights.push('🍬 High blood sugar. Reduce sugar intake.');
    if (systolic > 140) insights.push('🩺 High BP detected. Consult your doctor.');

    // Upsert: update today's log if exists, create if not
    const log = await HealthLog.findOneAndUpdate(
      { userId, date },
      { userId, date, heartRate, systolic, diastolic, sugarLevel, steps, sleepHours, mood, insights },
      { upsert: true, new: true }
    );

    res.status(201).json({ log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/health/history — Get last 30 days of logs
const getHistory = async (req, res) => {
  try {
    const logs = await HealthLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/health/risk — Calculate risk score
const getRisk = async (req, res) => {
  try {
    const result = calculateRisk(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { logHealth, getHistory, getRisk };