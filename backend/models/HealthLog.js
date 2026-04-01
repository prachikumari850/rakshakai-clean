// Daily health log — stores user's vitals per day
const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    heartRate: { type: Number },     // bpm
    systolic: { type: Number },      // BP systolic (e.g. 120)
    diastolic: { type: Number },     // BP diastolic (e.g. 80)
    sugarLevel: { type: Number },    // mg/dL
    steps: { type: Number },         // daily steps
    sleepHours: { type: Number },    // hours of sleep
    mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
    insights: [{ type: String }],    // auto-generated warnings
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthLog', healthLogSchema);