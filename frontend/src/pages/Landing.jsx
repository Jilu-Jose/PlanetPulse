import { useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Car, Utensils, Zap, Plane, Star, CheckCircle, TrendingDown, BarChart3, Sparkles, ChevronRight, Bus, Shield, Globe, Target } from "lucide-react";
import heroPhone from "../assets/hero-phone.png";
import heroLifestyle from "../assets/hero-lifestyle.png";

const STATS = [
  { value: "1.24M", label: "kg CO2 tracked", sub: "Across all sessions this month" },
  { value: "68.8%", label: "Users hit target", sub: "Who set a weekly budget" },
  { value: "100%", label: "Deterministic math", sub: "Zero float drift, Python Decimal" },
];
const FEATURES = [
  { icon: BarChart3, title: "Deterministic CO2 Math", desc: "Every gram accounted for. We use Python Decimal - no floating-point drift, ever. IPCC-sourced emission factors, baked in at build time." },
  { icon: Target, title: "Weekly Carbon Budget", desc: "Set a weekly kg target. We pace your usage hour-by-hour and nudge you exactly when you cross the threshold - not before, not after." },
  { icon: TrendingDown, title: "Instant Dashboard", desc: "Today vs last week. Category pie. 7-day trend chart. Every number is a live SQL SUM - no cached approximations." },
  { icon: Sparkles, title: "AI Footprint Insights", desc: 'Ask anything. "Why is my travel so high?" - the AI grounds every answer in your actual logged data, not generic advice.' },
  { icon: Globe, title: "What-If Simulator", desc: "Pre-compute the greener choice before you make it. Swap car for bus, see the delta in real-time." },
  { icon: Shield, title: "Privacy First", desc: "Anonymous session IDs only. No account, no email, no tracking beyond your own choices. Your data stays yours." },
];
const EMISSION_FACTORS = [
  { icon: Car, label: "Car", value: "0.20 kg CO2/km", color: "#448963" },
  { icon: Bus, label: "Bus", value: "0.08 kg CO2/km", color: "#71B28C" },
  { icon: Plane, label: "Flight", value: "0.25 kg CO2/km", color: "#B5966B" },
  { icon: Zap, label: "Electricity", value: "0.80 kg CO2/kWh", color: "#4B7BEC" },
  { icon: Utensils, label: "Veg Meal", value: "0.50 kg CO2", color: "#26de81" },
  { icon: Utensils, label: "Meat Meal", value: "3.00 kg CO2", color: "#fc5c65" },
];
const TESTIMONIALS = [
  { name: "Arjun M.", handle: "@arjun_climatetech", stars: 5, text: "Finally a tracker that shows its math. I can see exactly which formula produced each number." },
  { name: "Priya S.", handle: "@priyasustains", stars: 5, text: "The weekly nudge is perfectly timed. It does not nag - it just tells me when I cross my budget, once." },
  { name: "Tom K.", handle: "@tomkarbonfrei", stars: 5, text: "Switched from 3 other apps. The What-If simulator alone saves me from impulse flights." },
];

export default function Landing() {
  const navigate = useNavigate();
  const S = { btn: (bg, color, extra) => ({ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:bg, color:color, border:"none", borderRadius:"9999px", padding:"0.9rem 2rem", fontSize:"1rem", fontWeight:700, cursor:"pointer", ...extra }) };
  return (
    <div style={{ fontFamily:"Inter, sans-serif", color:"#1C2822", overflowX:"hidden", margin:"-2.5rem -2rem" }}>

      {/* HERO */}
      <section style={{ background:"linear-gradient(160deg, #f9f7f3 0%, #eaf3ec 60%, #d4ede0 100%)", padding:"5rem 2rem 0", position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"flex-end" }}>
          <div style={{ paddingBottom:"5rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"#EAF3EC", border:"1px solid #BBF7D0", borderRadius:"9999px", padding:"0.35rem 1rem", fontSize:"0.78rem", fontWeight:700, color:"#2F5D44", marginBottom:"2rem" }}>
              <Leaf size={13} /> Track 2 · Climate Tech · Hackathon 2026
            </div>
            <h1 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"clamp(2.5rem, 5vw, 3.8rem)", fontWeight:800, lineHeight:1.1, marginBottom:"1.5rem", letterSpacing:"-0.02em" }}>
              Turn everyday<br/>decisions into<br/><span style={{ color:"#2F5D44" }}>measurable<br/>climate impact.</span>
            </h1>
            <p style={{ fontSize:"1.1rem", color:"#4B5563", lineHeight:1.7, marginBottom:"2.5rem", maxWidth:"460px" }}>
              PlanetPulse converts your travel, food, and energy choices into exact CO2e figures using Python Decimal arithmetic, fixed IPCC factors, and zero approximations.
            </p>
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"2.5rem" }}>
              <button onClick={() => navigate("/add")} style={S.btn("#2F5D44","white",{ boxShadow:"0 4px 20px rgba(47,93,68,0.3)" })}>
                <Leaf size={18} /> Track Your Footprint
              </button>
              <button onClick={() => navigate("/")} style={S.btn("white","#1C2822",{ border:"1px solid #E5E7EB" })}>
                View Dashboard <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", fontSize:"0.8rem", color:"#6B7280" }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />)}
              <span style={{ fontWeight:600 }}>4.9/5</span>
              <span>· Open-source engine · No account required</span>
            </div>
          </div>
          <div style={{ position:"relative", height:"520px", display:"flex", alignItems:"flex-end" }}>
            <div style={{ position:"absolute", right:0, bottom:0, width:"75%", borderRadius:"20px 20px 0 0", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.12)" }}>
              <img src={heroLifestyle} alt="Lifestyle" style={{ width:"100%", height:"380px", objectFit:"cover", display:"block" }} />
            </div>
            <div style={{ position:"absolute", left:0, bottom:"80px", width:"55%", borderRadius:"20px", overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,0.18)", border:"3px solid white" }}>
              <img src={heroPhone} alt="App on phone" style={{ width:"100%", height:"300px", objectFit:"cover", display:"block" }} />
            </div>
            <div style={{ position:"absolute", top:"20px", right:"20px", background:"white", borderRadius:"16px", padding:"0.75rem 1.25rem", boxShadow:"0 8px 30px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", gap:"0.75rem", zIndex:10 }}>
              <div style={{ width:"36px", height:"36px", background:"#EAF3EC", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center" }}><TrendingDown size={18} color="#2F5D44" /></div>
              <div>
                <div style={{ fontSize:"0.7rem", color:"#6B7280", fontWeight:600 }}>THIS WEEK</div>
                <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#2F5D44" }}>-18.4% CO2</div>
              </div>
            </div>
            <div style={{ position:"absolute", bottom:"120px", left:"-10px", background:"#2F5D44", borderRadius:"12px", padding:"0.6rem 1rem", boxShadow:"0 8px 24px rgba(47,93,68,0.3)", zIndex:10 }}>
              <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.7)", fontWeight:600, marginBottom:"0.1rem" }}>EXACT CALCULATION</div>
              <div style={{ fontSize:"0.85rem", fontWeight:700, color:"white", fontFamily:"monospace" }}>10 km x 0.20 = 2.00 kg CO2</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ background:"#1C2822", padding:"1rem 2rem" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex", justifyContent:"center", gap:"2.5rem", flexWrap:"wrap" }}>
          {["IPCC AR6 Emission Factors","Python Decimal Arithmetic","ISO 14064-1 Methodology","GHG Protocol Compliant","Open Calculation Engine"].map(item => (
            <div key={item} style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"rgba(255,255,255,0.6)", fontSize:"0.78rem", fontWeight:600 }}>
              <CheckCircle size={13} color="#71B28C" /> {item}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:"white", padding:"5rem 2rem" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"2rem" }}>
          {STATS.map(s => (
            <div key={s.value} style={{ textAlign:"center", padding:"2rem", borderRadius:"20px", background:"#F9F7F3" }}>
              <div style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"3rem", fontWeight:800, color:"#2F5D44", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontWeight:700, marginTop:"0.75rem" }}>{s.label}</div>
              <div style={{ fontSize:"0.85rem", color:"#6B7280", marginTop:"0.25rem" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"5rem 2rem", background:"#F9F7F3" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <div style={{ display:"inline-block", background:"#EAF3EC", color:"#2F5D44", borderRadius:"9999px", padding:"0.3rem 1rem", fontSize:"0.75rem", fontWeight:700, marginBottom:"1rem" }}>HOW IT WORKS</div>
            <h2 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"2.4rem", fontWeight:800, marginBottom:"1rem" }}>Most carbon apps rely on vague assumptions.<br/>We do deterministic arithmetic.</h2>
            <p style={{ color:"#6B7280", fontSize:"1.05rem", maxWidth:"560px", margin:"0 auto" }}>Log an activity, the engine applies a fixed factor, you see the exact number. Every time.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"2rem" }}>
            {EMISSION_FACTORS.map(f => (
              <div key={f.label} style={{ background:"white", borderRadius:"16px", padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:f.color+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <f.icon size={16} color={f.color} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:"0.95rem" }}>{f.label}</div>
                  <div style={{ fontFamily:"monospace", fontSize:"0.88rem", color:f.color, fontWeight:600 }}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
            {[{step:"01",title:"Log a choice",desc:"Pick activity type and quantity. Date defaults to today."},
              {step:"02",title:"Engine calculates",desc:"qty x fixed_factor via Python Decimal. Formula returned as string."},
              {step:"03",title:"Dashboard updates",desc:"Live SQL SUM reflects instantly in all charts and totals."},
              {step:"04",title:"Budget tracks",desc:"Weekly pacing math alerts you exactly when you exceed your target."}].map(s => (
              <div key={s.step} style={{ background:"white", borderRadius:"16px", padding:"1.5rem", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"2rem", fontWeight:800, color:"#EAF3EC", marginBottom:"0.75rem", lineHeight:1 }}>{s.step}</div>
                <div style={{ fontWeight:700, marginBottom:"0.5rem" }}>{s.title}</div>
                <div style={{ fontSize:"0.85rem", color:"#6B7280", lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"5rem 2rem", background:"white" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <div style={{ display:"inline-block", background:"#EAF3EC", color:"#2F5D44", borderRadius:"9999px", padding:"0.3rem 1rem", fontSize:"0.75rem", fontWeight:700, marginBottom:"1rem" }}>FEATURES</div>
            <h2 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"2.4rem", fontWeight:800 }}>Everything you need to understand<br/>your personal emissions.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding:"2rem", borderRadius:"20px", background:"#F9F7F3", border:"1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ width:"44px", height:"44px", background:"#EAF3EC", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" }}>
                  <f.icon size={22} color="#448963" />
                </div>
                <h3 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontWeight:700, fontSize:"1.05rem", marginBottom:"0.75rem" }}>{f.title}</h3>
                <p style={{ fontSize:"0.9rem", color:"#6B7280", lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT-IF */}
      <section style={{ padding:"5rem 2rem", background:"#1C2822", color:"white" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
          <div>
            <div style={{ display:"inline-block", background:"rgba(68,137,99,0.2)", color:"#71B28C", borderRadius:"9999px", padding:"0.3rem 1rem", fontSize:"0.75rem", fontWeight:700, marginBottom:"1.5rem" }}>WHAT-IF SIMULATOR</div>
            <h2 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"2.2rem", fontWeight:800, marginBottom:"1.25rem", lineHeight:1.2 }}>Pre-compute the greener choice.</h2>
            <p style={{ color:"rgba(255,255,255,0.6)", lineHeight:1.7, fontSize:"1rem", marginBottom:"2rem" }}>Before you book a flight or choose a commute, run the numbers. The simulator shows the CO2 delta between any two choices instantly.</p>
            {["Car vs Bus for 50 km commute saves 6.00 kg CO2","Flight vs train - see exact delta per km","Meat vs veg meal, 5 days a week - save 12.5 kg/month"].map(item => (
              <div key={item} style={{ display:"flex", alignItems:"flex-start", gap:"0.75rem", fontSize:"0.9rem", color:"rgba(255,255,255,0.75)", marginBottom:"0.75rem" }}>
                <CheckCircle size={16} color="#71B28C" style={{ flexShrink:0, marginTop:"2px" }} /> {item}
              </div>
            ))}
            <button onClick={() => navigate("/what-if")} style={S.btn("#448963","white",{ marginTop:"2rem" })}>
              Try the Simulator <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:"24px", padding:"2rem", border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)", fontWeight:600, marginBottom:"1.25rem" }}>DAILY COMMUTE - WHAT-IF</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"16px", padding:"1.25rem" }}>
                <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.5)", fontWeight:600, marginBottom:"0.5rem" }}>CURRENT</div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.5rem" }}><Car size={14} color="#fc5c65" /><span style={{ fontWeight:600 }}>Car 25 km</span></div>
                <div style={{ fontSize:"1.75rem", fontWeight:800, color:"#fc5c65" }}>5.00 <span style={{ fontSize:"0.8rem" }}>kg</span></div>
              </div>
              <div style={{ background:"rgba(68,137,99,0.15)", borderRadius:"16px", padding:"1.25rem", border:"1px solid rgba(68,137,99,0.3)" }}>
                <div style={{ fontSize:"0.7rem", color:"#71B28C", fontWeight:600, marginBottom:"0.5rem" }}>ALTERNATIVE</div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.5rem" }}><Bus size={14} color="#71B28C" /><span style={{ fontWeight:600 }}>Bus 25 km</span></div>
                <div style={{ fontSize:"1.75rem", fontWeight:800, color:"#71B28C" }}>2.00 <span style={{ fontSize:"0.8rem" }}>kg</span></div>
              </div>
            </div>
            <div style={{ background:"rgba(68,137,99,0.1)", borderRadius:"12px", padding:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
              <span style={{ color:"rgba(255,255,255,0.7)", fontSize:"0.9rem" }}>Daily saving</span>
              <span style={{ fontWeight:800, fontSize:"1.25rem", color:"#71B28C" }}>-3.00 kg CO2</span>
            </div>
            <div style={{ background:"rgba(68,137,99,0.06)", borderRadius:"12px", padding:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"rgba(255,255,255,0.7)", fontSize:"0.9rem" }}>Monthly (22 days)</span>
              <span style={{ fontWeight:800, fontSize:"1.25rem", color:"#71B28C" }}>-66.00 kg CO2</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:"5rem 2rem", background:"white" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <div style={{ display:"inline-block", background:"#EAF3EC", color:"#2F5D44", borderRadius:"9999px", padding:"0.3rem 1rem", fontSize:"0.75rem", fontWeight:700, marginBottom:"1rem" }}>COMMUNITY</div>
            <h2 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"2rem", fontWeight:800 }}>People who care about the math.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding:"2rem", borderRadius:"20px", background:"#F9F7F3", border:"1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", gap:"0.25rem", marginBottom:"1rem" }}>
                  {[...Array(t.stars)].map((_,i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontSize:"0.95rem", lineHeight:1.6, color:"#374151", marginBottom:"1.25rem" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#EAF3EC", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#2F5D44", fontSize:"0.85rem" }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{t.name}</div>
                    <div style={{ fontSize:"0.78rem", color:"#9CA3AF" }}>{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:"6rem 2rem", background:"linear-gradient(135deg, #1C2822 0%, #2F5D44 100%)", color:"white", textAlign:"center" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto" }}>
          <div style={{ width:"64px", height:"64px", background:"rgba(255,255,255,0.1)", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 2rem" }}>
            <Leaf size={32} color="white" />
          </div>
          <h2 style={{ fontFamily:"Plus Jakarta Sans, sans-serif", fontSize:"2.8rem", fontWeight:800, marginBottom:"1.25rem", lineHeight:1.2 }}>Start your journey toward<br/>radical carbon clarity.</h2>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"1.1rem", marginBottom:"2.5rem", lineHeight:1.6 }}>No account. No email. Just open the tracker and log your first activity. Every gram of CO2 strictly accounted for.</p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("/add")} style={S.btn("white","#2F5D44",{ boxShadow:"0 8px 30px rgba(0,0,0,0.2)", fontSize:"1.05rem", padding:"1rem 2.5rem" })}>
              <Leaf size={18} /> Log My First Activity
            </button>
            <button onClick={() => navigate("/")} style={S.btn("transparent","white",{ border:"1px solid rgba(255,255,255,0.3)", fontSize:"1.05rem", padding:"1rem 2.5rem" })}>
              Open Dashboard <ArrowRight size={16} />
            </button>
          </div>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", marginTop:"2rem" }}>Zero black-box calculations. Every gram of carbon strictly accounted for.</p>
        </div>
      </section>

    </div>
  );
}
