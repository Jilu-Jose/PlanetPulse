import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, GeoJSON } from 'react-leaflet';
import { Settings, Info, TrendingDown, Users, AlertCircle, Share2 } from 'lucide-react';
import { fetchProfile, updateProfile, fetchMapRegions, fetchMapMe } from '../api';

const ALL_REGIONS = [
  {"id": "delhi", "name": "Delhi"}, {"id": "mumbai", "name": "Mumbai"}, {"id": "bengaluru", "name": "Bengaluru"},
  {"id": "chennai", "name": "Chennai"}, {"id": "kolkata", "name": "Kolkata"}, {"id": "hyderabad", "name": "Hyderabad"},
  {"id": "pune", "name": "Pune"}, {"id": "ahmedabad", "name": "Ahmedabad"}, {"id": "jaipur", "name": "Jaipur"},
  {"id": "lucknow", "name": "Lucknow"}, {"id": "kanpur", "name": "Kanpur"}, {"id": "nagpur", "name": "Nagpur"},
  {"id": "indore", "name": "Indore"}, {"id": "thane", "name": "Thane"}, {"id": "bhopal", "name": "Bhopal"},
  {"id": "visakhapatnam", "name": "Visakhapatnam"}, {"id": "pimpri_chinchwad", "name": "Pimpri-Chinchwad"},
  {"id": "patna", "name": "Patna"}, {"id": "vadodara", "name": "Vadodara"}, {"id": "ghaziabad", "name": "Ghaziabad"},
  {"id": "ludhiana", "name": "Ludhiana"}, {"id": "agra", "name": "Agra"}, {"id": "nashik", "name": "Nashik"},
  {"id": "faridabad", "name": "Faridabad"}, {"id": "meerut", "name": "Meerut"}, {"id": "rajkot", "name": "Rajkot"},
  {"id": "kalyan_dombivli", "name": "Kalyan-Dombivli"}, {"id": "vasai_virar", "name": "Vasai-Virar"},
  {"id": "varanasi", "name": "Varanasi"}, {"id": "srinagar", "name": "Srinagar"}, {"id": "aurangabad", "name": "Aurangabad"},
  {"id": "dhanbad", "name": "Dhanbad"}, {"id": "amritsar", "name": "Amritsar"}, {"id": "navi_mumbai", "name": "Navi Mumbai"},
  {"id": "allahabad", "name": "Allahabad"}, {"id": "ranchi", "name": "Ranchi"}, {"id": "howrah", "name": "Howrah"},
  {"id": "coimbatore", "name": "Coimbatore"}, {"id": "jabalpur", "name": "Jabalpur"}, {"id": "gwalior", "name": "Gwalior"}
].sort((a,b) => a.name.localeCompare(b.name));

function getColor(val) {
  if (val > 15) return '#b91c1c'; // Dark red
  if (val > 10) return '#ef4444'; // Red
  if (val > 7) return '#f59e0b'; // Amber
  if (val > 4) return '#10b981'; // Emerald
  return '#34d399'; // Light Emerald
}


// India bounds: always fit full subcontinent
const INDIA_BOUNDS = [[6.5, 68.0], [35.7, 97.5]];

function MapUpdater({ mapData }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(INDIA_BOUNDS, { padding: [10, 10] });
  }, [map, mapData]);
  return null;
}

// Draws India's border per Survey of India's official claimed territory
// (includes J&K / PoK, Aksai Chin, Arunachal Pradesh)
function IndiaBorder() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Primary: Datameet composite — follows Survey of India claimed boundary
    const PRIMARY = 'https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson';
    // Fallback: simplified country outline
    const FALLBACK = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

    fetch(PRIMARY)
      .then(r => {
        if (!r.ok) throw new Error('primary failed');
        return r.json();
      })
      .then(setGeoData)
      .catch(() => {
        // fallback: filter just India from the world countries dataset
        fetch(FALLBACK)
          .then(r => r.json())
          .then(world => {
            const india = {
              ...world,
              features: world.features.filter(
                f => f.properties.ADMIN === 'India' || f.properties.name === 'India'
              ),
            };
            setGeoData(india);
          })
          .catch(() => {}); // silently fail — map still works without border
      });
  }, []);

  if (!geoData) return null;

  return (
    <GeoJSON
      key="india-border"
      data={geoData}
      style={{
        color: '#2F5D44',      // --color-primary-dark
        weight: 2,
        fillColor: 'transparent',
        fillOpacity: 0,
        opacity: 0.85,
      }}
    />
  );
}

export default function MapTab() {
  const [profile, setProfile] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [meData, setMeData] = useState(null);
  
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showSettings, setShowSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState({ region_id: '', share_to_map: false });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchProfile().then(p => {
      setProfile(p);
      setEditingProfile({ region_id: p.region_id || '', share_to_map: p.share_to_map || false });
      if (!p.share_to_map) setShowSettings(true);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMapRegions(offset).then(data => {
      setMapData(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [offset]);

  useEffect(() => {
    if (profile?.share_to_map && profile?.region_id) {
      fetchMapMe().then(setMeData).catch(() => setMeData(null));
    } else {
      setMeData(null);
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await updateProfile(editingProfile.region_id || null, editingProfile.share_to_map);
      setProfile(updated);
      setShowSettings(false);
    } catch (err) {
      alert("Failed to save settings: " + (err.detail || err.message));
    } finally {
      setSavingSettings(false);
    }
  };

  const getOffsetLabel = (o) => {
    if (o === 0) return 'Today (Forecast)';
    if (o < 0) return `${Math.abs(o)} Days Ago`;
    return `In ${o} Days (Forecast)`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Carbon Pulse Map</h1>
          <p className="page-subtitle">Interactive emissions forecast and telemetry across India.</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-light"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
        >
          <Settings size={18} />
          <span>My Region</span>
        </button>
      </div>

      {showSettings && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#F0FDF4', border: '1px solid #86EFAC', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <Share2 style={{ color: 'var(--color-primary-dark)', marginTop: '0.25rem' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Participate in the Pulse</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Share your aggregated, anonymized footprint to help build the live map.</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: '1rem', height: '1rem' }}
                    checked={editingProfile.share_to_map}
                    onChange={e => setEditingProfile(prev => ({...prev, share_to_map: e.target.checked}))}
                  />
                  Contribute data anonymously
                </label>
                
                {editingProfile.share_to_map && (
                  <select 
                    className="form-control"
                    style={{ maxWidth: '250px', padding: '0.5rem' }}
                    value={editingProfile.region_id}
                    onChange={e => setEditingProfile(prev => ({...prev, region_id: e.target.value}))}
                  >
                    <option value="" disabled>Select your region...</option>
                    {ALL_REGIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                )}
                
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings || (editingProfile.share_to_map && !editingProfile.region_id)}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flexShrink: 0 }}>
          
          {/* Timeline Scrubber */}
          <div className="card">
            <div className="label-sm" style={{ marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>TIMELINE</div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>{getOffsetLabel(offset)}</div>
            
            <input 
              type="range" 
              min="-7" max="7" 
              value={offset} 
              onChange={e => setOffset(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>
              <span>Actuals</span>
              <span>Today</span>
              <span>Forecast</span>
            </div>
          </div>

          {/* National Stats */}
          {mapData && (
            <div className="card">
              <div className="label-sm" style={{ marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>NATIONAL AVERAGES</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-main)', lineHeight: 1 }}>{mapData.national_mean}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)', paddingBottom: '0.25rem' }}>kg CO₂/user</span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Info size={14} /> {mapData.kind === 'forecast' ? 'Projected' : 'Recorded'}
              </div>
            </div>
          )}

          {/* User's impact */}
          {meData ? (
            <div className="card" style={{ border: '2px solid var(--color-mint-border)', background: 'var(--color-primary-light)' }}>
              <div className="label-sm" style={{ marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>MY 7-DAY AVERAGE</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1 }}>{meData.my_7d_mean}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', paddingBottom: '0.15rem' }}>kg CO₂/day</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 500, lineHeight: 1.4 }}>
                {meData.my_7d_mean < meData.region_7d_mean 
                  ? <span style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>Awesome! You're below </span>
                  : <span style={{ color: '#D97706', fontWeight: 700 }}>You are slightly above </span>
                } the 7-day average for your region ({meData.region_7d_mean} kg).
              </div>
            </div>
          ) : (
             <div className="card" style={{ background: 'var(--color-bg-subtle)', border: 'none', textAlign: 'center', padding: '2rem 1.5rem' }}>
                <Users size={32} style={{ margin: '0 auto 0.75rem', color: '#9CA3AF' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500, margin: 0 }}>Opt in and select a region to compare your footprint.</p>
             </div>
          )}

        </div>

        {/* Map Area */}
        <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', position: 'relative', zIndex: 0 }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '1.25rem' }}>Loading Telemetry...</div>
            </div>
          )}
          
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5}
            minZoom={4}
            maxZoom={10}
            maxBounds={[[6.0, 68.0], [37.5, 98.0]]}
            maxBoundsViscosity={0.8}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <IndiaBorder />
            <MapUpdater mapData={mapData} />
            
            {mapData?.regions.map(r => (
              <CircleMarker
                key={r.region_id}
                center={[r.lat, r.lng]}
                pathOptions={{
                  fillColor: getColor(r.value_kg_per_user_day),
                  color: 'white',
                  weight: 1,
                  fillOpacity: r.source === 'real' ? 0.9 : 0.6
                }}
                radius={r.source === 'real' ? 12 : 8}
              >
                <Tooltip>
                  <div style={{ fontFamily: 'var(--font-sans)', minWidth: '150px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{r.name}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
                      {r.value_kg_per_user_day.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>kg CO₂</span>
                    </div>
                    
                    {mapData.kind === 'forecast' && (
                       <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                          Range: {r.lower.toFixed(1)} - {r.upper.toFixed(1)} kg
                       </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E5E7EB' }}>
                      <span className="badge badge-gray" style={{ background: r.source === 'real' ? '#D1FAE5' : '#F3F4F6', color: r.source === 'real' ? '#065F46' : '#4B5563', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        {r.source}
                      </span>
                      {r.source === 'real' && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={10}/> {r.contributors} active</span>
                      )}
                      {mapData.kind === 'forecast' && (
                        <span className="badge badge-gray" style={{ 
                          background: r.confidence === 'high' ? '#D1FAE5' : r.confidence === 'medium' ? '#FEF3C7' : '#FEE2E2',
                          color: r.confidence === 'high' ? '#065F46' : r.confidence === 'medium' ? '#92400E' : '#991B1B',
                          fontSize: '0.65rem', textTransform: 'capitalize' 
                        }}>
                          {r.confidence} Conf.
                        </span>
                      )}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
