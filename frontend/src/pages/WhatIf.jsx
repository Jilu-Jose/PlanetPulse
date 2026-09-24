import { useState, useEffect } from 'react';
import { fetchMeta, calculateWhatIf } from '../api';
import { ArrowRight, Leaf, Car, Bus, Train, Bike, Sparkles, CheckCircle2, Zap, TrendingDown, Utensils, BatteryCharging } from 'lucide-react';

const CATEGORY_ICONS = {
  travel: <Car size={20} />,
  food: <Utensils size={20} />,
  energy: <BatteryCharging size={20} />,
};

const CATEGORY_COLORS = {
  travel: { bg: '#d4ede0', text: '#1e5c38' },
  food:   { bg: '#c6e3d4', text: '#2d7a50' },
  energy: { bg: '#b5dbc8', text: '#3a9664' },
};

const STATIC_BENCHMARKS = {
  travel: [
    { name: 'Car (Gasoline)', kg: 4.80, color: '#1e5c38', icon: <Car size={16}/> },
    { name: 'EV Car', kg: 2.10, color: '#2d7a50', icon: <Car size={16}/> },
    { name: 'Bus (Municipal)', kg: 1.50, color: '#3a9664', icon: <Bus size={16}/> },
    { name: 'Train / Metro', kg: 0.90, color: '#52b37e', icon: <Train size={16}/> },
    { name: 'Bicycle / Walk', kg: 0.00, color: '#88cca8', icon: <Bike size={16}/> },
  ],
  food: [
    { name: 'Beef Meal', kg: 6.61, color: '#1e5c38', icon: <Utensils size={16}/> },
    { name: 'Pork / Lamb Meal', kg: 3.50, color: '#2d7a50', icon: <Utensils size={16}/> },
    { name: 'Chicken Meal', kg: 1.58, color: '#3a9664', icon: <Utensils size={16}/> },
    { name: 'Vegetarian Meal', kg: 0.80, color: '#52b37e', icon: <Utensils size={16}/> },
    { name: 'Vegan Meal', kg: 0.50, color: '#88cca8', icon: <Utensils size={16}/> },
  ],
  energy: [
    { name: 'Coal Electricity', kg: 0.82, color: '#1e5c38', icon: <BatteryCharging size={16}/> },
    { name: 'Grid Average (IN)', kg: 0.71, color: '#2d7a50', icon: <BatteryCharging size={16}/> },
    { name: 'Natural Gas', kg: 0.49, color: '#3a9664', icon: <BatteryCharging size={16}/> },
    { name: 'Solar PV', kg: 0.05, color: '#52b37e', icon: <BatteryCharging size={16}/> },
    { name: 'Wind Energy', kg: 0.01, color: '#88cca8', icon: <BatteryCharging size={16}/> },
  ],
};

export default function WhatIf() {
  const [meta, setMeta] = useState(null);

  // Current Activity State
  const [cCat, setCCat] = useState('travel');
  const [cAct, setCAct] = useState('');
  const [cQty, setCQty] = useState(25);

  // Alt Activity State
  const [aCat, setACat] = useState('travel');
  const [aAct, setAAct] = useState('');
  const [aQty, setAQty] = useState(25);

  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchMeta().then(data => {
      setMeta(data);
    });
  }, []);

  const getActs = (cat) => meta?.categories[cat] || [];
  const getUnit = (cat, actType) => {
    const acts = getActs(cat);
    return acts.find(a => a.activity_type === actType)?.unit || (cat === 'travel' ? 'km' : cat === 'energy' ? 'kWh' : 'meal');
  };

  const handleCompare = async () => {
    if (!cCat || !cAct || !aCat || !aAct) return;
    try {
      const data = await calculateWhatIf({
        current_category: cCat,
        current_activity: cAct,
        current_quantity: parseFloat(cQty),
        current_unit: getUnit(cCat, cAct),
        alt_category: aCat,
        alt_activity: aAct,
        alt_quantity: parseFloat(aQty),
        alt_unit: getUnit(aCat, aAct),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleCompare();
  }, [cAct, cQty, aAct, aQty, cCat, aCat]);

  // When category changes, reset the selected activity
  const handleCCatChange = (val) => { setCCat(val); setCAct(''); setResult(null); };
  const handleACatChange = (val) => { setACat(val); setAAct(''); setResult(null); };

  const benchmarks = STATIC_BENCHMARKS[cCat] || STATIC_BENCHMARKS.travel;
  const maxKg = Math.max(...benchmarks.map(b => b.kg), 0.01);
  const currentCatStyle = CATEGORY_COLORS[cCat] || CATEGORY_COLORS.travel;
  const altCatStyle = CATEGORY_COLORS[aCat] || CATEGORY_COLORS.travel;

  if (!meta) return <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <span className="badge badge-gray" style={{ background: '#E5E7EB' }}><Zap size={12} style={{ marginRight: '0.25rem' }} color="var(--color-primary)" /> Deterministic Model</span>
        <span className="badge badge-gray" style={{ background: 'white', border: '1px solid #E5E7EB' }}>ISO 14064 Calibrated</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">What-If Scenario Simulator</h1>
          <p className="page-subtitle">Simulate greener alternatives across travel, food, and energy — and measure the exact CO₂ savings.</p>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Baseline Card */}
        <div className="card" style={{ border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div className="badge badge-gray">Current Activity</div>
            <div className="label-sm">BASELINE PROFILE</div>
          </div>

          {/* Category Selector */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>CATEGORY</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['travel', 'food', 'energy'].map(cat => (
                <button key={cat} onClick={() => handleCCatChange(cat)} style={{
                  flex: 1, padding: '0.6rem', borderRadius: '10px', border: '2px solid',
                  borderColor: cCat === cat ? CATEGORY_COLORS[cat].text : '#E5E7EB',
                  background: cCat === cat ? CATEGORY_COLORS[cat].bg : 'transparent',
                  color: cCat === cat ? CATEGORY_COLORS[cat].text : 'var(--color-text-muted)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s'
                }}>
                  {CATEGORY_ICONS[cat]}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ background: currentCatStyle.bg, padding: '0.5rem', borderRadius: '10px' }}>
                <span style={{ color: currentCatStyle.text }}>{CATEGORY_ICONS[cCat]}</span>
              </div>
              <select className="form-control" style={{ fontSize: '1.1rem', fontWeight: 700, border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }} value={cAct} onChange={e => setCAct(e.target.value)}>
                <option value="" disabled>Select baseline...</option>
                {getActs(cCat).map(a => <option key={a.activity_type} value={a.activity_type}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}><Zap size={14} /> Quantity</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <input type="number" value={cQty} onChange={e => setCQty(e.target.value)} min="0" style={{ width: '70px', border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 700, textAlign: 'right' }} />
              <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{getUnit(cCat, cAct)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="label-sm" style={{ marginBottom: '0.5rem' }}>GROSS EMISSIONS</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                {result ? result.current_co2e_kg.toFixed(3) : '0.000'} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>kg CO₂e</span>
              </div>
            </div>
            <div className="badge badge-error" style={{ padding: '0.4rem 0.75rem' }}>Baseline</div>
          </div>
        </div>

        {/* Alternative Card */}
        <div className="card" style={{ border: '2px solid var(--color-primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div className="badge badge-mint">Alternative Selected</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></div> Real-time Recalculation</div>
          </div>

          {/* Category Selector */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>CATEGORY</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['travel', 'food', 'energy'].map(cat => (
                <button key={cat} onClick={() => handleACatChange(cat)} style={{
                  flex: 1, padding: '0.6rem', borderRadius: '10px', border: '2px solid',
                  borderColor: aCat === cat ? 'var(--color-primary)' : '#E5E7EB',
                  background: aCat === cat ? 'var(--color-primary-light)' : 'transparent',
                  color: aCat === cat ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s'
                }}>
                  {CATEGORY_ICONS[cat]}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <div className="label-sm" style={{ marginBottom: '0.5rem' }}>SELECT ALTERNATIVE</div>
            <select className="form-control" style={{ fontSize: '1.1rem', fontWeight: 600, background: 'var(--color-bg-subtle)', border: 'none', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }} value={aAct} onChange={e => setAAct(e.target.value)}>
              <option value="" disabled>Select alternative...</option>
              {getActs(aCat).map(a => <option key={a.activity_type} value={a.activity_type}>{a.label}</option>)}
            </select>
          </div>

          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}><ArrowRight size={14} color="var(--color-primary)" /> Quantity</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <input type="number" value={aQty} onChange={e => setAQty(e.target.value)} min="0" style={{ width: '70px', border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 700, textAlign: 'right', color: 'var(--color-primary-dark)' }} />
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>{getUnit(aCat, aAct)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="label-sm" style={{ marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>SIMULATED EMISSIONS</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-primary)' }}>
                {result && aAct ? result.alt_co2e_kg.toFixed(3) : '0.000'} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>kg CO₂e</span>
              </div>
            </div>
            {result && result.saving_pct > 0 && <div className="badge badge-mint" style={{ padding: '0.4rem 0.75rem', fontWeight: 700 }}>↓ {result.saving_pct}% Saved</div>}
          </div>
        </div>
      </div>

      {result && result.saving_kg > 0 && (
        <div style={{ background: 'var(--color-primary-light)', borderRadius: '24px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid var(--color-mint-border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Leaf size={32} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>Potential Saving: {result.saving_kg.toFixed(3)} kg CO₂e per entry!</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>
              <Sparkles size={16} /> Over 200 repetitions, that is <strong style={{ color: 'var(--color-text-main)' }}>{(result.saving_kg * 200).toFixed(1)} kg CO₂e saved</strong> — equivalent to planting <strong style={{ color: 'var(--color-text-main)' }}>{Math.round((result.saving_kg * 200) / 21)} trees</strong>.
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 'var(--radius-pill)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', border: '1px solid var(--color-mint-border)', boxShadow: 'var(--shadow-sm)' }}>
            <TrendingDown size={20} color="var(--color-primary)" /> {result.saving_pct}% REDUCTION
          </div>
        </div>
      )}

      <div className="grid grid-cols-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Benchmark Comparison — {cCat.charAt(0).toUpperCase() + cCat.slice(1)}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Reference CO₂e figures for common {cCat} choices</p>
            </div>
            <div className="badge badge-gray" style={{ background: 'var(--color-bg-subtle)' }}>Unit: kg CO₂e</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {benchmarks.map(item => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.color }}>{item.icon} <span style={{ color: 'var(--color-text-main)' }}>{item.name}</span></span>
                  <span>{item.kg.toFixed(2)} kg</span>
                </div>
                <div style={{ height: '12px', background: 'var(--color-bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(item.kg / maxKg) * 100}%`, background: item.color, borderRadius: '6px', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ background: 'var(--color-bg-subtle)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              <div style={{ background: 'white', color: 'var(--color-primary)', padding: '0.4rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}><Zap size={16} /></div>
              Engine Verification Note
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              All comparison figures are derived deterministically using peer-reviewed IPCC and UK DEFRA emission factors. The AI never hallucinates raw calculations.
            </p>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={14} /> Deterministic Math Layer Active
            </div>
          </div>

          <div className="card" style={{ border: '1px solid #E5E7EB', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: '#FEF3C7', color: '#B45309', padding: '0.75rem', borderRadius: '50%' }}><Sparkles size={20} /></div>
            <div>
              <div className="label-sm" style={{ marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>HABIT RECOMMENDATION</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Switching just 2 times/week saves <strong style={{ color: 'var(--color-primary-dark)' }}>{((result?.saving_kg || 0) * 2).toFixed(2)} kg CO₂e</strong> automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
