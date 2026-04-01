// ============================================================
// riskEngine.js — Rule-based health risk prediction
// Input: age, weight, height, smoker, diabetic, bp, steps
// Output: { level: "Low|Medium|High", score, reasons[] }
// ============================================================

const calculateRisk = ({ age, weight, height, smoker, diabetic, highBP, steps, sleepHours }) => {
  let score = 0;
  const reasons = [];

  // BMI Calculation
  const bmi = weight / ((height / 100) ** 2);

  if (bmi >= 30) { score += 25; reasons.push('Obese BMI (≥30)'); }
  else if (bmi >= 25) { score += 15; reasons.push('Overweight BMI (25–29.9)'); }

  // Age factor
  if (age >= 60) { score += 20; reasons.push('Age 60+ (higher cardiovascular risk)'); }
  else if (age >= 40) { score += 10; reasons.push('Age 40–59'); }

  // Lifestyle
  if (smoker) { score += 25; reasons.push('Active smoker'); }
  if (diabetic) { score += 20; reasons.push('Diabetic'); }
  if (highBP) { score += 20; reasons.push('High blood pressure'); }

  // Activity
  if (steps < 3000) { score += 15; reasons.push('Very low physical activity (<3000 steps)'); }
  else if (steps < 6000) { score += 5; reasons.push('Below average steps (3000–5999)'); }

  // Sleep
  if (sleepHours < 5) { score += 15; reasons.push('Severe sleep deprivation (<5 hrs)'); }
  else if (sleepHours < 6) { score += 8; reasons.push('Insufficient sleep (5–6 hrs)'); }

  // Determine level
  let level;
  if (score >= 50) level = 'High';
  else if (score >= 25) level = 'Medium';
  else level = 'Low';

  return { level, score, bmi: bmi.toFixed(1), reasons };
};

module.exports = { calculateRisk };