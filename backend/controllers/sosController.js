// SOS Controller — handles emergency alert broadcasts via Socket.io
const sendSOS = async (req, res) => {
  try {
    const io = req.app.get('io'); // Get socket.io instance
    const { userId, latitude, longitude, message } = req.body;

    const alert = {
      userId,
      latitude,
      longitude,
      message: message || '🚨 EMERGENCY SOS ALERT!',
      timestamp: new Date().toISOString(),
    };

    // Broadcast SOS to all connected clients (admin/emergency responders)
    io.emit('sos-alert', alert);

    // Also notify user's own room (for confirmation)
    if (userId) io.to(userId).emit('sos-confirmed', { message: 'SOS sent successfully!' });

    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendSOS };