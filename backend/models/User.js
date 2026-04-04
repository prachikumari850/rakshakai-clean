// User model — stores account credentials and basic profile
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    age: { type: Number },
    bloodGroup: { type: String },
    phone: { type: String },
    googleId: { type: String },             // Google sub ID (for OAuth link)
    googleAccessToken: { type: String },    // latest access token (short-lived)
    fitData: {
      steps: { type: Number, default: 0 },
      heartRate: { type: Number, default: 0 },
      sleepHours: { type: Number, default: 0 },
      lastSynced: { type: Date },
  },
}, 
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);