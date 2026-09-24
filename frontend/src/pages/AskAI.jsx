import { useState } from 'react';
import { askAI } from '../api';
import { Send, User, Loader2, Sparkles, AlertCircle, Leaf, BarChart2, Car, Zap, CheckCircle2, Paperclip, Mic, Lock, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AskAI() {
  const [messages, setMessages] = useState([
    { 
      role: 'user', 
      content: "I noticed my electricity footprint jumped yesterday. What caused that and what simple steps can I take?",
      time: "14:24"
    },
    {
      role: 'ai',
      badge: "Verified Calculation Mode",
      time: "14:24",
      content: `Your electricity footprint was **3.10 kg CO2e** yesterday (approx. **8.2 kWh**), which is **~28% higher** than your weekday average of 2.42 kg CO2e. This is primarily attributed to your evening HVAC/cooling cycle.`,
      highlightBox: {
        title: "Cooling: 4.5 kWh (~1.70 kg CO2e)",
        sub: "Active 17:30 - 22:15 - 54.8% of daily energy load"
      },
      mitigations: [
        "**Adjust thermostat by +1°C:** Yields a measurable 7% reduction in compressor demand without noticeable thermal drift.",
        "**Shift heavy appliances:** Run dishwasher and washing machine cycles during regional off-peak green hours (before 4:00 PM)."
      ],
      sources: [
        {id: "DEFRA 2023 Grid Factors", url: "#"},
        {id: "EPA eGRID 2023 Data", url: "#"},
        {id: "IEA Residential Guidelines", url: "#"}
      ]
    },
    {
      role: 'user',
      content: "How does that compare to driving 25 km in a petrol car?",
      time: "14:26"
    },
    {
      role: 'ai',
      badge: "Direct Equivalency",
      time: "14:26",
      content: "Driving 25 km in an average petrol car generates **4.80 kg CO2e**. That means your entire day of electricity (**3.10 kg CO2e**) is actually **35% less carbon-intensive** than that single 25 km drive!",
      equivalencyBox: {
        netDiff: "-1.70 kg CO2e",
        item1: { name: "Petrol Vehicle (25 km)", val: "4.80 kg" },
        item2: { name: "Full Day Home Electricity (8.2 kWh)", val: "3.10 kg" }
      }
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setLoading(true);

    try {
      const res = await askAI(userMsg);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          badge: "Context Synthesis",
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          content: res.text, 
          rawSources: res.sources,
          error: res.status === 'ai_unavailable'
        }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't connect to the server right now.", error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormatting = (text) => {
    return text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} style={{color: 'var(--color-primary-dark)'}}>{part}</strong> : part);
  };

  const pieData = [{name: 'Home', value: 40}, {name: 'Mobility', value: 35}, {name: 'Food', value: 25}];
  const COLORS = ['#448963', '#71B28C', '#B5966B'];

  return (
    <div className="animate-fade-in" style={{display: 'flex', gap: '2rem'}}>
      
      {/* Main Chat Column */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem'}}>
          <div>
            <div className="label-sm" style={{display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', color: 'var(--color-primary)'}}>
              <Zap size={14} /> NEURAL ENVIRONMENTAL ENGINE V4.2
            </div>
            <h1 className="page-title" style={{color: 'var(--color-primary-dark)'}}>PlanetPulse Climate Assistant</h1>
            <p className="page-subtitle">Ask anything about your carbon data, sustainable switches, or emission factors.</p>
          </div>
          <div className="badge badge-gray" style={{background: '#E5E7EB'}}>
            <div style={{width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-muted)', marginRight: '0.5rem'}}></div>
            GHG Protocol Mode: Scope 1-3
          </div>
        </div>

        <div style={{background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem'}}>
              <AlertCircle size={16} color="var(--color-text-muted)" />
              <div>
                <strong>Operational Simulation Alert</strong> • <span style={{color: 'var(--color-text-muted)'}}>Real-time Telemetry Active</span>
                <div style={{color: 'var(--color-text-muted)', marginTop: '0.1rem'}}>AI insights engine status check. If servers are busy: "AI insights are temporarily unavailable. Your carbon calculations are still available."</div>
              </div>
           </div>
           <div className="badge badge-mint" style={{background: 'var(--color-primary-light)'}}>
              <div style={{width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', marginRight: '0.5rem'}}></div> Status: Operational
           </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
           <div className="label-sm">SUGGESTED EXPLORATION PROMPTS</div>
           <div style={{fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer'}}>Shuffle Prompts ↻</div>
        </div>
        
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
           {[
             {icon: <Leaf size={14} color="var(--color-primary)" />, text: "How can I reduce my travel footprint?"},
             {icon: <BarChart2 size={14} color="#3B82F6" />, text: "What's my biggest emission source this month?"},
             {icon: <Car size={14} color="#6B7280" />, text: "Compare bus vs electric car for 10km"}
           ].map((p, i) => (
             <div key={i} style={{background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-pill)', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)'}}>
               {p.icon} {p.text}
             </div>
           ))}
        </div>

        {/* Chat History */}
        <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem', minHeight: '400px'}}>
          {messages.map((msg, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
              <div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                {msg.role === 'user' ? 'You' : 'PlanetPulse AI'} - {msg.time}
                {msg.badge && <span className="badge badge-gray" style={{background: 'white', border: '1px solid #E5E7EB', fontSize: '0.65rem'}}><CheckCircle2 size={10} style={{marginRight: '0.25rem'}}/> {msg.badge}</span>}
              </div>
              
              <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '85%'}}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? '#E5E7EB' : 'var(--color-primary-dark)',
                  color: msg.role === 'user' ? 'var(--color-text-main)' : 'white'
                }}>
                  {msg.role === 'user' ? <User size={16} /> : <Leaf size={16} />}
                </div>
                
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  background: msg.role === 'user' ? 'var(--color-primary-dark)' : 'var(--color-bg-base)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
                  border: msg.role === 'ai' ? '1px solid #E5E7EB' : 'none',
                  boxShadow: msg.role === 'ai' ? 'var(--shadow-sm)' : 'none',
                  fontSize: '0.95rem',
                  lineHeight: 1.6
                }}>
                  <div>{renderFormatting(msg.content)}</div>
                  
                  {/* Specialized structured content blocks */}
                  {msg.highlightBox && (
                    <div style={{marginTop: '1.5rem', background: 'var(--color-bg-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                       <div style={{background: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)'}}><Zap size={20} color="var(--color-primary)" /></div>
                       <div style={{flex: 1}}>
                         <div style={{fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>{msg.highlightBox.title} <span className="badge badge-gray" style={{fontSize: '0.6rem'}}>Estimate</span></div>
                         <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>{msg.highlightBox.sub}</div>
                       </div>
                       <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Zap size={12}/> Smart Meter Synced</div>
                    </div>
                  )}

                  {msg.mitigations && (
                    <div style={{marginTop: '1.5rem'}}>
                      <div className="label-sm" style={{color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Zap size={14}/> Targeted Micro-Mitigations:</div>
                      {msg.mitigations.map((m, idx) => (
                        <div key={idx} style={{display: 'flex', gap: '0.75rem', marginBottom: '0.5rem'}}>
                           <div style={{background: 'var(--color-primary-dark)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0}}>{idx+1}</div>
                           <div style={{fontSize: '0.85rem'}}>{renderFormatting(m)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.equivalencyBox && (
                    <div style={{marginTop: '1.5rem', background: 'var(--color-bg-subtle)', borderRadius: '12px', padding: '1.25rem'}}>
                       <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem'}}>
                         <span style={{color: 'var(--color-text-muted)'}}>Comparative Carbon Load</span>
                         <span style={{color: 'var(--color-primary-dark)'}}>Net Difference: {msg.equivalencyBox.netDiff}</span>
                       </div>
                       <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500}}>
                          <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Car size={14}/> {msg.equivalencyBox.item1.name}</span>
                          <span>{msg.equivalencyBox.item1.val}</span>
                       </div>
                       <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500}}>
                          <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)'}}><Zap size={14}/> {msg.equivalencyBox.item2.name}</span>
                          <span style={{color: 'var(--color-primary-dark)'}}>{msg.equivalencyBox.item2.val}</span>
                       </div>
                       <div style={{height: '6px', background: '#D1D5DB', borderRadius: '3px', position: 'relative', marginBottom: '1rem'}}>
                          <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, width: '65%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
                       </div>
                       <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                         <div style={{width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={{fontSize: '10px'}}>💡</span></div>
                         Perspective: Skipping 1 roundtrip car commute offsets ~3 days of typical household energy emissions.
                       </div>
                    </div>
                  )}

                  {/* Real RAG Sources mapping */}
                  {(msg.sources || msg.rawSources) && (
                    <div style={{marginTop: '1.5rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem'}}>
                      <div className="label-sm" style={{marginBottom: '0.75rem'}}>VERIFIED METHODOLOGY CITATIONS</div>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {(msg.sources || msg.rawSources).map((s, idx) => (
                          <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="badge badge-gray" style={{background: 'white', border: '1px solid #E5E7EB', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                            <div style={{width: '12px', height: '12px', background: '#E5E7EB', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={{fontSize: '8px'}}>📄</span></div>
                            {s.id} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div style={{display: 'flex', gap: '1rem'}}>
               <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 <Leaf size={16} />
               </div>
               <div style={{padding: '1rem', background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: '16px', borderTopLeftRadius: '4px', display: 'flex', alignItems: 'center'}}>
                 <Loader2 size={20} className="animate-spin" style={{color: 'var(--color-primary)'}} />
               </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{position: 'relative'}}>
           <form onSubmit={handleSend} style={{background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)'}}>
              <input 
                type="text" 
                placeholder="Ask about your emissions, recipes, travel alternatives..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{flex: 1, border: 'none', background: 'transparent', fontSize: '0.95rem', outline: 'none', color: 'var(--color-text-main)'}}
              />
              <div style={{display: 'flex', gap: '0.5rem', color: 'var(--color-text-muted)'}}>
                <button type="button" style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit'}}><Paperclip size={18} /></button>
                <button type="button" style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit'}}><Mic size={18} /></button>
              </div>
              <button type="submit" disabled={!input.trim() || loading} style={{background: 'var(--color-primary-dark)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!input.trim() || loading) ? 0.5 : 1}}>
                 <span style={{fontSize: '18px', fontWeight: 800}}>↑</span>
              </button>
           </form>
           <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>
              <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Lock size={12}/> Private & Anonymized • Press Enter ↵ to calculate</span>
              <span>Token Budget: <strong>94%</strong> Remaining</span>
           </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div style={{width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
         
         <div className="card" style={{background: 'var(--color-bg-base)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
               <h3 style={{fontSize: '1.1rem', fontWeight: 700}}>Your Telemetry Snapshot</h3>
               <div className="badge badge-gray" style={{background: 'var(--color-bg-subtle)'}}>Live Oct 24</div>
            </div>

            <div style={{display: 'flex', gap: '0.75rem', marginBottom: '1.5rem'}}>
               <div style={{flex: 1, background: 'var(--color-bg-subtle)', borderRadius: '12px', padding: '1rem'}}>
                  <div className="label-sm" style={{marginBottom: '0.25rem'}}>Month-to-Date</div>
                  <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1, marginBottom: '0.5rem'}}>142.4 <span style={{fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>kg CO2e</span></div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.1rem'}}>📉 -12.4% vs Sept</div>
               </div>
               <div style={{flex: 1, background: 'var(--color-bg-subtle)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem'}}>
                  <div className="label-sm" style={{marginBottom: '0.25rem'}}>Budget Target</div>
                  <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1, marginBottom: '0.5rem'}}>210.0 <span style={{fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>kg CO2e</span></div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem'}}>🏳️ 68% consumed</div>
               </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
               <div style={{width: '80px', height: '80px', position: 'relative'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontSize: '0.85rem', fontWeight: 800}}>7d</span>
                    <span style={{fontSize: '0.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase'}}>Split</span>
                  </div>
               </div>
               <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500}}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{display: 'flex', justifyContent: 'space-between'}}>
                       <span style={{display: 'flex', alignItems: 'center', gap: '0.35rem'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', background: COLORS[i]}}></div> {d.name} Energy</span>
                       <span>{d.value}%</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="card" style={{background: 'var(--color-bg-base)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
               <h3 style={{fontSize: '1.1rem', fontWeight: 700}}>Quick What-If Scenarios</h3>
               <div style={{color: 'var(--color-text-muted)'}}><Zap size={14}/></div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem'}}>
               {[
                 {title: "Switch 2 commute days to Rail", saved: "-18.4 kg/wk", desc: "Cuts transit emissions by 62% per passenger km."},
                 {title: "Adopt Plant-Based Weekdays", saved: "-11.2 kg/wk", desc: "Replaces ruminant meat with legumes and grains."},
                 {title: "Smart Power Strip for Office", saved: "-3.8 kg/wk", desc: "Eliminates standby vampire draw overnight."}
               ].map((s, i) => (
                 <div key={i} style={{border: '1px solid #E5E7EB', borderRadius: '12px', padding: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                       <span style={{fontWeight: 600, fontSize: '0.85rem'}}>{s.title}</span>
                       <span style={{color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.8rem'}}>{s.saved}</span>
                    </div>
                    <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>{s.desc}</div>
                 </div>
               ))}
            </div>

            <button className="btn btn-light" style={{width: '100%', fontSize: '0.85rem', background: 'var(--color-bg-subtle)'}}>
              Run Custom Simulation &rarr;
            </button>
         </div>

         <div className="card" style={{border: 'none', background: 'transparent', boxShadow: 'none', padding: '0', display: 'flex', gap: '1rem'}}>
            <div style={{background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start'}}><CheckCircle2 size={20} color="var(--color-primary)"/></div>
            <div>
               <div style={{fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-primary-dark)'}}>Scientific Integrity Guarantee</div>
               <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5}}>All conversational conversions are backed by peer-reviewed IPCC AR6 factors and regional grid carbon intensity APIs updated hourly.</div>
            </div>
         </div>

      </div>
    </div>
  );
}
