import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Finder() {
  const [position, setPosition] = useState(null);
  const [type, setType] = useState('hospital');
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setPosition([28.6139, 77.2090]) // Default: New Delhi
    );
  }, []);

  const searchNearby = async () => {
    if (!position) return;
    setLoading(true);
    // Use Overpass API (OpenStreetMap) — free, no API key needed
    const [lat, lon] = position;
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"](around:5000,${lat},${lon});
        way["amenity"="${type}"](around:5000,${lat},${lon});
      );
      out center 20;
    `;
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });
      const data = await res.json();
      setPlaces(data.elements.map((el) => ({
        id: el.id,
        name: el.tags?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} (Unnamed)`,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        phone: el.tags?.phone || el.tags?.['contact:phone'] || 'N/A',
      })).filter((p) => p.lat && p.lon));
    } catch {
      alert('Failed to fetch nearby places. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">🗺️ Hospital & Medicine Finder</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Find hospitals, pharmacies and clinics near your current location using live OpenStreetMap data.
        </p>

        {/* Controls */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['hospital', 'pharmacy', 'clinic', 'doctors'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: `1px solid ${type === t ? 'var(--teal)' : 'var(--border-glass)'}`,
                  background: type === t ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: type === t ? 'var(--teal)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'hospital' ? '🏥' : t === 'pharmacy' ? '💊' : t === 'clinic' ? '🏨' : '👨‍⚕️'} {t}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={searchNearby} disabled={loading || !position} style={{ marginLeft: 'auto' }}>
            {loading ? 'Searching...' : 'Search Nearby →'}
          </button>
        </div>

        {/* Map */}
        {position && (
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '1.5rem', height: '450px', border: '1px solid var(--border-glass)' }}>
            <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
              />
              {/* User location */}
              <Circle center={position} radius={200} pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.2 }} />
              <Marker position={position}>
                <Popup><strong>📍 Your Location</strong></Popup>
              </Marker>
              {/* Search results */}
              {places.map((place) => (
                <Marker key={place.id} position={[place.lat, place.lon]}>
                  <Popup>
                    <strong>{place.name}</strong><br />
                    📞 {place.phone}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Results List */}
        {places.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>
              Found {places.length} {type}(s) nearby
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {places.slice(0, 10).map((place) => (
                <div key={place.id} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{place.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      📞 {place.phone}
                    </div>
                  </div>
                  
                  < a href={`https://www.openstreetmap.org/directions?from=${position[0]},${position[1]}&to=${place.lat},${place.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="btn-ghost" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                      Directions →
                    </button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}