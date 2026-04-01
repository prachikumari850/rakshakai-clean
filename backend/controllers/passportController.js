const QRCode = require('qrcode');
const MedicalPassport = require('../models/MedicalPassport');

// POST /api/passport/create — Create or update medical passport
const createPassport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, age, bloodGroup, allergies, diseases, medications, emergencyContact } = req.body;

    // Check if user already has a passport
    let passport = await MedicalPassport.findOne({ userId });

    if (!passport) {
      passport = new MedicalPassport({ userId, name, age, bloodGroup, allergies, diseases, medications, emergencyContact });
    } else {
      // Update existing
      Object.assign(passport, { name, age, bloodGroup, allergies, diseases, medications, emergencyContact });
    }

    // Generate QR code pointing to public passport URL
    const passportUrl = `${process.env.CLIENT_URL}/passport/${passport.passportId}`;
    passport.qrCodeDataUrl = await QRCode.toDataURL(passportUrl);

    await passport.save();
    res.status(201).json({ passport });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/passport/my — Get user's own passport
const getMyPassport = async (req, res) => {
  try {
    const passport = await MedicalPassport.findOne({ userId: req.user._id });
    if (!passport) return res.status(404).json({ message: 'No passport found' });
    res.json({ passport });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/passport/public/:passportId — Public view (no auth required)
const getPublicPassport = async (req, res) => {
  try {
    const passport = await MedicalPassport.findOne({ passportId: req.params.passportId });
    if (!passport) return res.status(404).json({ message: 'Passport not found' });

    // Return only critical info — no internal IDs
    res.json({
      name: passport.name,
      age: passport.age,
      bloodGroup: passport.bloodGroup,
      allergies: passport.allergies,
      diseases: passport.diseases,
      medications: passport.medications,
      emergencyContact: passport.emergencyContact,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPassport, getMyPassport, getPublicPassport };