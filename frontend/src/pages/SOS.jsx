import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socketService';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ FIX Leaflet icon (MOVE OUTSIDE COMPONENT)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function SOS() {
  const { user } = useAuth();

  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [contact, setContact] = useState(null);

  // ✅ CLEAN useEffect (ONLY ONE)
  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket(user._id);

    socket.on('sos-alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 10));
    });

    // 📍 Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => setLocError('Location access denied.')
      );
    }

    // 🔥 Fetch emergency contact
    // const fetchContact = async () => {
    //   try {
    //     const res = await api.get('/passport/my');
    //     console.log(res.data);
    //     setContact(res.data.passport.emergencyContact);
    //   } catch {
    //     console.log('No emergency contact found');
    //   }
    // };

    const fetchContact = async () => {
  try {
    const res = await api.get('/passport/my');

    console.log("PASSPORT:", res.data);

    const contactData =
      res.data?.emergencyContact ||
      res.data?.passport?.emergencyContact;

    setContact(contactData);
  } catch (err) {
    console.log('No emergency contact found', err);
  }
};

    fetchContact();

    // ✅ Cleanup
    return () => {
      if (socket) socket.off('sos-alert');
    };
  }, [user]);

  // ✅ SOS FUNCTION
  const handleSOS = async () => {
    if (!location) {
      alert('Location not available!');
      return;
    }

    if (!contact?.phone) {
      alert('Please add emergency contact in Medical Passport!');
      return;
    }

    setSending(true);

    try {
      const { latitude, longitude } = location;

      const mapLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;

      const message = `🚨 EMERGENCY! ${user?.name} needs help!\nLocation: ${mapLink}`;

      // ✅ WhatsApp dynamic
      window.open(
        `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`,
        '_blank'
      );

      // 🔊 Siren
      const audio = new Audio('/siren.mp3');
      audio.play();

      // 🌐 Backend
      await api.post('/sos/send', {
        userId: user?._id,
        latitude,
        longitude,
        message: `🚨 EMERGENCY! ${user?.name} needs immediate help!`,
      });

      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch {
      alert('Failed to send SOS.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '700px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">🚨 Emergency SOS</h1>

        {/* Location */}
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          {location ? (
            <p>📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
          ) : (
            <p>{locError || 'Getting location...'}</p>
          )}
        </div>

        {/* SOS Button */}
        {/* <div style={{ textAlign: 'center' }}>
          <button onClick={handleSOS} disabled={sending}>
            {sending ? 'Sending...' : '🆘 SOS'}
          </button>
        </div> */}

    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <motion.button
    onClick={handleSOS}
    disabled={sending}
    whileTap={{ scale: 0.9 }}
    animate={
      sending
        ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.8 } }
        : { scale: 1 }
    }
    style={{
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #ff4d6d, #cc0033)',
      border: '4px solid rgba(255, 0, 60, 0.5)',
      color: '#fff',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.3rem',
      margin: '0 auto',
      boxShadow: '0 0 25px rgba(255, 0, 60, 0.6), 0 0 60px rgba(255, 0, 60, 0.4)',
      transition: 'all 0.3s ease-in-out',
    }}
  >
    <span style={{ fontSize: '2.5rem' }}>🆘</span>
    <span>{sending ? 'Sending...' : 'SOS'}</span>
  </motion.button>
  </div>

        {/* Map */}
        {location && (
          <MapContainer center={[location.latitude, location.longitude]} zoom={15} style={{ height: '300px', marginTop: '2rem' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>You are here 🚨</Popup>
            </Marker>
          </MapContainer>
        )}
      </motion.div>
    </div>
  );

}