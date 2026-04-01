// Medical Passport — emergency medical profile with QR code
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const medicalPassportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passportId: { type: String, default: uuidv4, unique: true }, // unique URL ID
    name: { type: String, required: true },
    age: { type: Number, required: true },
    bloodGroup: { type: String, required: true },
    allergies: { type: String },
    diseases: { type: String },
    medications: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    qrCodeDataUrl: { type: String }, // Base64 QR image
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalPassport', medicalPassportSchema);