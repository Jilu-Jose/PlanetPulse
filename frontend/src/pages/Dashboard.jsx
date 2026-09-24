import { useState, useEffect, useMemo } from 'react';
import { fetchDashboard } from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, Activity, Car, Utensils, Zap, Sparkles, AlertCircle, RefreshCw, Leaf } from 'lucide-react';
import WeeklyTargetCard from '../components/WeeklyTargetCard';

const COLORS = ['#448963', '#71B28C', '#B5966B'];

export default function Dashboard({ refreshKey }) {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [targetRefresh, setTargetRefresh] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchDashboard(range).then(res => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [range, refreshKey]);

  const pieData = useMemo(() => {
    if (!data) return [];
    return data.categories.map(c => ({
      name: c.category,
      value: c.percentage,
      kg: c.co2e_kg
    }));
  }, [data]);

  if (loading) return <div style={{padding: '2rem'}}>Loading telemetry...</div>;
  if (!data) return <div>Error loading data</div>;

  const getIcon = (cat) => {
    if (cat === 'travel') return <Car size={20} color="#448963" />;
    if (cat === 'food') return <Utensils size={20} color="#B5966B" />;
    if (cat === 'electricity') return <Zap size={20} color="#448963" />;
    return <Activity size={20} />;
  };
  const targetProgress = data.weekly_target_progress;

  return (
    <div className="animate-fade-in">
      
      {/* Offline Sync Banner (Mock)
      <div style={{background: '#FFF1F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div style={{background: '#FEE2E2', padding: '0.5rem', borderRadius: '50%'}}><RefreshCw size={16} color="#DC2626" /></div>
          <div>
            <div style={{fontWeight: 700, color: '#991B1B', fontSize: '0.9rem'}}>Offline Sync Paused</div>
            <div style={{color: '#991B1B', fontSize: '0.8rem'}}>Unable to reach the secondary PlanetPulse ingest node.</div>
          </div>
        </div>
        <button className="btn btn-outline" style={{padding: '0.25rem 1rem', fontSize: '0.8rem', color: '#DC2626', borderColor: '#FECACA'}}>Retry Now</button>
      </div> */}

      {/* Main Header Card */}
      <div className="card" style={{marginBottom: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
               <Leaf size={16} color="var(--color-primary)" />
               <span style={{fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-main)'}}>YOUR CARBON FOOTPRINT</span>
               <span style={{color: 'var(--color-primary)', fontSize: '0.75rem'}}>• Live Telemetry</span>
            </div>
            
            <div className="label-sm" style={{marginBottom: '0.5rem'}}>TODAY'S TOTAL FOOTPRINT</div>
            <div style={{fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
              {data.total_co2e_kg.toFixed(2)} <span style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>kg CO2e</span>
            </div>
          </div>
          
          <div style={{display: 'flex', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-pill)', padding: '0.25rem'}}>
            {['today', 'week', 'month'].map(r => (
              <button 
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '0.25rem 1rem', 
                  borderRadius: 'var(--radius-pill)', 
                  border: 'none', 
                  background: range === r ? 'white' : 'transparent',
                  boxShadow: range === r ? 'var(--shadow-sm)' : 'none',
                  fontWeight: range === r ? 600 : 500,
                  fontSize: '0.85rem',
                  color: range === r ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
           <div className="badge badge-mint" style={{padding: '0.4rem 0.75rem'}}>
              <TrendingDown size={14} style={{marginRight: '0.25rem'}} />
              {data.comparison_vs_previous_pct > 0 ? '+' : ''}{data.comparison_vs_previous_pct?.toFixed(1)}% {data.comparison_label}
           </div>
           {targetProgress && targetProgress.status !== 'no_target' && (
             <div className="badge badge-gray" style={{padding: '0.4rem 0.75rem', background: '#F3F4F6'}}>
               • {targetProgress.percent_used?.toFixed(0)}% of {targetProgress.target_kg?.toFixed(1)} kg weekly target used
             </div>
           )}
        </div>
      </div>

      {/* Weekly Target Card — Feature 4 (prominent at top) */}
      <div style={{marginBottom: '1.5rem'}}>
        <WeeklyTargetCard
          progress={targetProgress}
          onRefresh={() => setRange(r => r)}
        />
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-3" style={{marginBottom: '1.5rem'}}>
        {['travel', 'food', 'electricity'].map((catName, idx) => {
          const cat = data.categories.find(c => c.category === catName) || { co2e_kg: 0, percentage: 0 };
          const titleMap = { travel: 'TRAVEL & TRANSIT', food: 'FOOD & DIET', electricity: 'ELECTRICITY & UTILITIES' };
          
          return (
            <div className="card" key={catName} style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem'}}>
                <div style={{width: '40px', height: '40px', background: catName === 'food' ? '#FDF8F3' : 'var(--color-primary-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {getIcon(catName)}
                </div>
                <div className="badge badge-gray">{cat.percentage}% of total</div>
              </div>
              <div className="label-sm" style={{marginBottom: '0.5rem'}}>{titleMap[catName]}</div>
              <div style={{fontSize: '2rem', fontWeight: 800, lineHeight: 1, marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem'}}>
                {cat.co2e_kg.toFixed(2)} <span style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>kg CO2e</span>
              </div>
              
              <div style={{marginTop: 'auto'}}>
                <div style={{height: '4px', background: 'var(--color-bg-subtle)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.75rem'}}>
                   <div style={{height: '100%', width: `${cat.percentage}%`, background: COLORS[idx], borderRadius: '2px'}}></div>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><RefreshCw size={10} /> Active tracking</span>
                  <span style={{color: catName === 'travel' ? 'var(--color-error)' : 'var(--color-primary)'}}>
                    {catName === 'travel' ? '+0.4 vs Mon' : '-0.8 vs avg'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3" style={{marginBottom: '1.5rem'}}>
        {/* Chart */}
        <div className="card" style={{gridColumn: 'span 2'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
            <div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem'}}>7-Day Footprint Trend</h3>
              <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Normalized carbon trajectory against rolling 7.90 kg baseline</p>
            </div>
            <div style={{display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600}}>
              <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><span style={{width:'12px', height:'3px', background:'var(--color-primary)'}}></span> Daily Total</span>
              <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><span style={{width:'12px', height:'2px', borderTop:'2px dashed #9CA3AF'}}></span> Weekly Avg (7.9 kg)</span>
            </div>
          </div>
          
          <div style={{height: '240px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCo2e" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 10}} dx={-10} tickFormatter={(v) => `${v} kg`} />
                <Tooltip />
                <ReferenceLine y={7.9} stroke="#9CA3AF" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="co2e_kg" stroke="var(--color-primary-dark)" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2e)" activeDot={{r: 6, fill: 'var(--color-primary-dark)', stroke: 'white', strokeWidth: 2}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem'}}>Category Share</h3>
          <p style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Distribution across active tracking streams</p>
          
          <div style={{height: '180px', position: 'relative', marginTop: '1rem'}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
              <span className="label-sm">TOTAL</span>
              <span style={{fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1}}>{data.total_co2e_kg.toFixed(2)}</span>
              <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>kg CO2e</span>
            </div>
          </div>

          <div style={{marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {pieData.map((entry, index) => (
              <div key={entry.name} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <div style={{width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length]}}></div>
                  <span style={{textTransform: 'capitalize'}}>{entry.name}</span>
                </div>
                <div>
                  <span style={{fontWeight: 700, marginRight: '0.5rem'}}>{entry.kg.toFixed(2)} kg</span>
                  <span style={{color: 'var(--color-text-muted)'}}>({entry.value.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div className="card" style={{gridColumn: 'span 2'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>Top Contributors</h3>
              <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Ranked emission events logged in current cycle</p>
            </div>
            <a href="#" style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>View All Log &rarr;</a>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {data.top_contributors.slice(0, 3).map((item, idx) => (
              <div key={item.id} style={{display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px'}}>
                <div style={{width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem'}}>
                  {getIcon(item.category)}
                </div>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                    <span style={{fontWeight: 700}}>{item.label || item.activity_type}</span>
                    <span className={`badge ${item.intensity_badge === 'high' ? 'badge-error' : 'badge-gray'}`} style={{fontSize: '0.65rem', padding: '0.15rem 0.5rem'}}>
                      {item.intensity_badge === 'high' ? 'High Intensity' : (item.intensity_badge === 'moderate' ? 'Moderate' : 'Standard')}
                    </span>
                  </div>
                  <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>{item.description}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 700, fontSize: '1.1rem'}}>{item.co2e_kg.toFixed(2)} kg</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>{item.percentage_of_daily}% of daily limit</div>
                </div>
              </div>
            ))}
            {data.top_contributors.length === 0 && <div style={{padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)'}}>No data available.</div>}
          </div>
        </div>

        <div className="card" style={{background: 'var(--color-bg-subtle)', border: 'none'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700}}>
              <div style={{background: 'var(--color-primary)', color: 'white', padding: '0.25rem', borderRadius: '8px'}}><Sparkles size={16} /></div>
              AI Insight & Tips
            </div>
            <div className="badge badge-gray" style={{background: '#E5E7EB'}}>Synthesis</div>
          </div>
          
          <div style={{background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem'}}>
             <div style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-start'}}>
                <Sparkles size={16} color="var(--color-primary)" style={{marginTop: '0.25rem', flexShrink: 0}} />
                <div style={{fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-main)'}}>
                  Replacing your morning solo car commute with the express bus 3 times a week would reduce your monthly footprint by <strong style={{color: 'var(--color-primary-dark)'}}>39.6 kg CO2e</strong> (down <strong>18%</strong>).
                </div>
             </div>
             <div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <AlertCircle size={12} /> Based on your activity + sourced IPCC & DEFRA knowledge base
             </div>
          </div>

          <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
             <div style={{flex: 1, background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)'}}>
                <div className="label-sm" style={{marginBottom: '0.25rem'}}>Simulated ROI</div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)'}}>-18.4%</div>
                <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Annualized trajectory</div>
             </div>
             <div style={{flex: 1, background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)'}}>
                <div className="label-sm" style={{marginBottom: '0.25rem'}}>Estimated Savings</div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)'}}>$124.00</div>
                <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Monthly fuel delta</div>
             </div>
          </div>

          <div style={{display: 'flex', gap: '0.75rem'}}>
             <button className="btn btn-primary" style={{flex: 1, padding: '0.75rem'}}><Sparkles size={16} /> Explain my footprint</button>
             <button className="btn btn-light" style={{flex: 1, background: 'white', border: '1px solid #E5E7EB'}}>Ask a question</button>
          </div>
        </div>
      </div>
    </div>
  );
}
