import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


function AutoResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
}

export default function Finder() {
  const [position, setPosition] = useState(null);
  const [type, setType] = useState('hospital');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3. SECURE LOCATION FETCH
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setPosition([28.6139, 77.2090]), // Fallback: New Delhi
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const searchNearby = async () => {
    if (!position) return;
    setLoading(true);
    const [lat, lon] = position;

    // Multi-type query (Nodes, Ways, Relations)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"](around:5000,${lat},${lon});
        way["amenity"="${type}"](around:5000,${lat},${lon});
        relation["amenity"="${type}"](around:5000,${lat},${lon});
      );
      out center;
    `.trim();

    // 4. FAILOVER LOGIC: Try mirrors if primary is busy
    const mirrors = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter'
    ];

    let success = false;
    for (const url of mirrors) {
      if (success) break;
      try {
        const response = await fetch(`${url}?data=${encodeURIComponent(overpassQuery)}`);
        if (!response.ok) continue;

        const data = await response.json();
        const results = data.elements.map((el) => ({
          id: el.id,
          name: el.tags?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} (Unnamed)`,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          phone: el.tags?.phone || el.tags?.['contact:phone'] || 'N/A',
          address: el.tags?.['addr:street'] || 'Nearby area'
        })).filter(p => p.lat && p.lon);

        setPlaces(results);
        success = true;
      } catch (err) {
        console.warn(`Mirror ${url} failed, retrying...`);
      }
    }

    if (!success) alert("Map servers are busy. Please try again in 10 seconds.");
    setLoading(false);
  };

  return (
    <div className="finder-container" style={{ padding: '20px', color: '#fff', background: '#0a0a0a', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: '2rem', color: '#00d4ff' }}>📍 Rakshak Finder</h2>
        <p style={{ opacity: 0.7, marginBottom: '20px' }}>Emergency resource locator with live OSM data.</p>

        {/* UI Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['hospital', 'pharmacy', 'clinic', 'doctors'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: `1px solid ${type === t ? '#00d4ff' : '#333'}`,
                background: type === t ? 'rgba(0, 212, 255, 0.2)' : '#1a1a1a',
                color: type === t ? '#00d4ff' : '#aaa',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
          <button 
            onClick={searchNearby} 
            disabled={loading || !position}
            style={{ 
              marginLeft: 'auto', 
              background: '#00d4ff', 
              color: '#000', 
              border: 'none', 
              padding: '10px 25px', 
              borderRadius: '12px', 
              fontWeight: 'bold',
              cursor: 'pointer' 
            }}
          >
            {loading ? 'Searching...' : 'Find Nearby'}
          </button>
        </div>

        {/* Map Window */}
        {position ? (
          <div style={{ height: '450px', borderRadius: '15px', overflow: 'hidden', border: '1px solid #333' }}>
            <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
              <AutoResize />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle center={position} radius={500} pathOptions={{ color: '#00d4ff' }} />
              <Marker position={position}><Popup>Your Position</Popup></Marker>
              
              {places.map(place => (
                <Marker key={place.id} position={[place.lat, place.lon]}>
                  <Popup>
                    <div style={{ color: '#000' }}>
                      <strong>{place.name}</strong><br/>
                      📞 {place.phone}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', borderRadius: '15px' }}>
            <p>Waiting for GPS permissions...</p>
          </div>
        )}

        {/* Results Cards */}
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {places.map(place => (
            <div key={place.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#00d4ff' }}>{place.name}</h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{place.address}</p>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`, '_blank')}
                style={{ background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '5px 10px', borderRadius: '5px', marginTop: '10px', cursor: 'pointer' }}
              >
                Directions
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
