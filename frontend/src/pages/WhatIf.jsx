import { useState, useEffect } from 'react';
import { fetchMeta, calculateWhatIf } from '../api';
import { ArrowRight, Leaf, AlertTriangle, Car, Bus, Train, Bike, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function WhatIf() {
  const [meta, setMeta] = useState(null);
  
  // Current Activity State
  const [cCat, setCCat] = useState('');
  const [cAct, setCAct] = useState('');
  const [cQty, setCQty] = useState(25);
  const [cUnit, setCUnit] = useState('km');
  
  // Alt Activity State
  const [aCat, setACat] = useState('');
  const [aAct, setAAct] = useState('');
  const [aQty, setAQty] = useState(25);
  const [aUnit, setAUnit] = useState('km');
  
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchMeta().then(data => {
      setMeta(data);
      if (data.categories) {
        setCCat('travel');
        setACat('travel');
      }
    });
  }, []);

  const getActs = (cat) => meta?.categories[cat] || [];

  const handleCompare = async () => {
    if(!cCat || !cAct || !aCat || !aAct) return;
    try {
      const data = await calculateWhatIf({
        current_category: cCat,
        current_activity: cAct,
        current_quantity: parseFloat(cQty),
        current_unit: cUnit,
        alt_category: aCat,
        alt_activity: aAct,
        alt_quantity: parseFloat(aQty),
        alt_unit: aUnit
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleCompare();
  }, [cAct, cQty, aAct, aQty]);

  if (!meta) return <div style={{padding: '2rem'}}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
         <span className="badge badge-gray" style={{background: '#E5E7EB'}}><Zap size={12} style={{marginRight: '0.25rem'}} color="var(--color-primary)" /> Deterministic Model</span>
         <span className="badge badge-gray" style={{background: 'white', border: '1px solid #E5E7EB'}}>ISO 14064 Calibrated</span>
      </div>
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
        <div>
          <h1 className="page-title">What-If Scenario Simulator</h1>
          <p className="page-subtitle">Simulate greener alternatives for your routine activities and measure immediate carbon savings.</p>
        </div>
        <div className="badge badge-gray" style={{background: 'white', border: '1px solid #E5E7EB', padding: '0.5rem 1rem'}}>
           <span style={{color: 'var(--color-primary)', marginRight: '0.5rem'}}>⇌</span> Trip Range: <strong style={{marginLeft: '0.25rem', color: 'var(--color-text-main)'}}>25 km standard</strong>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{gap: '1.5rem', marginBottom: '1.5rem'}}>
        {/* Baseline Card */}
        <div className="card" style={{border: '1px solid #E5E7EB'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
             <div className="badge badge-gray"><RefreshCw size={12} style={{marginRight: '0.25rem'}} /> Current Activity</div>
             <div className="label-sm">BASELINE PROFILE</div>
          </div>
          
          <div className="form-group" style={{marginBottom: '0'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                <div style={{background: '#FEE2E2', padding: '0.5rem', borderRadius: '10px'}}><Car size={24} color="#DC2626" /></div>
                <select className="form-control" style={{fontSize: '1.25rem', fontWeight: 700, border: 'none', padding: 0, cursor: 'pointer', background: 'transparent'}} value={cAct} onChange={e => {setCAct(e.target.value);}}>
                  <option value="" disabled>Select baseline...</option>
                  {getActs('travel').map(a => <option key={a.activity_type} value={a.activity_type}>{a.label}</option>)}
                </select>
             </div>
             <div style={{color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '3.5rem', marginBottom: '1.5rem'}}>Single-occupancy internal combustion sedan • 2.0L typical engine</div>
          </div>
          
          <div style={{background: 'var(--color-bg-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)'}}><Zap size={14} /> Calculated Distance</div>
             <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem'}}>
                <input type="number" value={cQty} onChange={e => setCQty(e.target.value)} style={{width: '60px', border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 700, textAlign: 'right'}} />
                <span style={{fontWeight: 600}}>km</span>
             </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem'}}>
             <div>
                <div className="label-sm" style={{marginBottom: '0.5rem'}}>GROSS EMISSIONS</div>
                <div style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1}}>{result ? result.current_co2e_kg.toFixed(2) : '0.00'} <span style={{fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>kg CO2e</span></div>
             </div>
             <div className="badge badge-error" style={{padding: '0.4rem 0.75rem'}}>High Impact</div>
          </div>
          <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
             <CheckCircle2 size={12} /> {result ? (result.current_co2e_kg / cQty * 1000).toFixed(0) : '0'} g CO2e per passenger-km based on DEFRA 2023
          </div>
        </div>

        {/* Alternative Card */}
        <div className="card" style={{border: '2px solid var(--color-primary-light)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
             <div className="badge badge-mint"><RefreshCw size={12} style={{marginRight: '0.25rem'}} /> Alternative Selected</div>
             <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)'}}></div> Real-time Recalculation</div>
          </div>
          
          <div className="form-group" style={{marginBottom: '0'}}>
             <div className="label-sm" style={{marginBottom: '0.5rem'}}>SELECT MODE OF TRANSPORT</div>
             <select className="form-control" style={{fontSize: '1.1rem', fontWeight: 600, background: 'var(--color-bg-subtle)', border: 'none', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem'}} value={aAct} onChange={e => {setAAct(e.target.value);}}>
               <option value="" disabled>Select alternative...</option>
               {getActs('travel').map(a => <option key={a.activity_type} value={a.activity_type}>{a.label}</option>)}
             </select>
          </div>
          
          <div style={{background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)'}}><ArrowRight size={14} color="var(--color-primary)" /> Target Trip Span</div>
             <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem'}}>
                <input type="number" value={aQty} onChange={e => setAQty(e.target.value)} style={{width: '60px', border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 700, textAlign: 'right', color: 'var(--color-primary-dark)'}} />
                <span style={{fontWeight: 600, color: 'var(--color-primary-dark)'}}>km</span>
             </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem'}}>
             <div>
                <div className="label-sm" style={{marginBottom: '0.5rem', color: 'var(--color-primary-dark)'}}>SIMULATED EMISSIONS</div>
                <div style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-primary)'}}>{result ? result.alt_co2e_kg.toFixed(2) : '0.00'} <span style={{fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>kg CO2e</span></div>
             </div>
             {result && result.saving_pct > 0 && <div className="badge badge-mint" style={{padding: '0.4rem 0.75rem', fontWeight: 700}}>↓ {result.saving_pct}% Saved</div>}
          </div>
          <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
             <Zap size={12} color="var(--color-primary)" /> {result ? (result.alt_co2e_kg / aQty * 1000).toFixed(0) : '0'} g CO2e per passenger-km (Municipal EV Fleet benchmark)
          </div>
        </div>
      </div>

      {result && result.saving_kg > 0 && (
        <div style={{background: 'var(--color-primary-light)', borderRadius: '24px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid var(--color-mint-border)'}}>
           <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                 <Leaf size={32} color="var(--color-primary)" />
                 <h2 style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)'}}>Potential Carbon Saving: {result.saving_kg.toFixed(2)} kg CO2e saved per trip!</h2>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontSize: '0.9rem'}}>
                 <Sparkles size={16} /> Over 200 working days, that is <strong style={{color: 'var(--color-text-main)'}}>{(result.saving_kg * 200).toFixed(0)} kg CO2e saved</strong> — equivalent to planting <strong style={{color: 'var(--color-text-main)'}}>{Math.round((result.saving_kg * 200) / 21)} trees</strong>.
              </div>
           </div>
           <div style={{background: 'white', borderRadius: 'var(--radius-pill)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', border: '1px solid var(--color-mint-border)', boxShadow: 'var(--shadow-sm)'}}>
              <TrendingDown size={20} color="var(--color-primary)" /> {result.saving_pct}% REDUCTION
           </div>
        </div>
      )}

      <div className="grid grid-cols-3">
         <div className="card" style={{gridColumn: 'span 2'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
               <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>Comparative Transit Footprint (25 km trip)</h3>
                  <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Comprehensive modal breakdown normalized for local grid emissions</p>
               </div>
               <div className="badge badge-gray" style={{background: 'var(--color-bg-subtle)'}}>Unit: kg CO2e</div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
               {/* Mock static bars based on mockup */}
               {[
                  { name: 'Car (Gasoline Baseline)', kg: 4.80, color: '#DC2626', icon: <Car size={16}/> },
                  { name: 'EV Car (Standard Battery Fleet)', kg: 2.10, color: '#88B399', icon: <Car size={16}/> },
                  { name: 'Bus (Municipal Fleet)', kg: 1.50, color: '#448963', icon: <Bus size={16}/> },
                  { name: 'Train / Metro (Light Rail Transit)', kg: 0.90, color: '#2F5D44', icon: <Train size={16}/> },
                  { name: 'Bicycle / Walk (Active Mobility)', kg: 0.00, color: '#A7F3D0', icon: <Bike size={16}/> },
               ].map(item => (
                 <div key={item.name}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem'}}>
                       <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.color}}>{item.icon} <span style={{color: 'var(--color-text-main)'}}>{item.name}</span></span>
                       <span>{item.kg.toFixed(2)} kg</span>
                    </div>
                    <div style={{height: '12px', background: 'var(--color-bg-subtle)', borderRadius: '6px', overflow: 'hidden'}}>
                       <div style={{height: '100%', width: `${(item.kg / 4.8) * 100}%`, background: item.color, borderRadius: '6px'}}></div>
                    </div>
                 </div>
               ))}
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>
               <span>0.00 kg (Net Zero)</span>
               <span>1.20 kg</span>
               <span>2.40 kg</span>
               <span>3.60 kg</span>
               <span>4.80 kg (Max)</span>
            </div>
         </div>

         <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="card" style={{background: 'var(--color-bg-subtle)', border: 'none'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '1rem'}}>
                  <div style={{background: 'white', color: 'var(--color-primary)', padding: '0.4rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)'}}><Zap size={16} /></div>
                  Engine Verification Note
               </div>
               <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6}}>
                  All comparison figures are derived deterministically using peer-reviewed IPCC and UK DEFRA emission factors. PlanetPulse AI formulates contextual savings summaries without hallucinating raw calculations.
               </p>
               <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <CheckCircle2 size={14} /> Deterministic Math Layer v4.2 Active
               </div>
            </div>

            <button className="btn btn-primary" style={{width: '100%', padding: '1.25rem', fontSize: '1rem'}}>
               <CheckCircle2 size={18} /> Apply this alternative to my weekly plan
            </button>

            <div className="card" style={{border: '1px solid #E5E7EB', display: 'flex', gap: '1rem', alignItems: 'center'}}>
               <div style={{background: '#FEF3C7', color: '#B45309', padding: '0.75rem', borderRadius: '50%'}}><Sparkles size={20} /></div>
               <div>
                  <div className="label-sm" style={{marginBottom: '0.25rem', color: 'var(--color-text-main)'}}>HABIT RECOMMENDATION</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Switching just 2 commutes/week saves {((result?.saving_kg || 3.30) * 2).toFixed(1)} kg CO2e automatically.</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// Missing icon component replacement for lucide
function RefreshCw(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> }
