import { useState } from 'react';
import { askAI } from '../api';
import { Send, User, Loader2, Sparkles, AlertCircle, Leaf, BarChart2, Car, Zap, CheckCircle2, Paperclip, Mic, Lock } from 'lucide-react';

export default function AskAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setLoading(true);

    try {
      const res = await askAI(userMsg);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          badge: 'Context Synthesis',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: res.text,
          rawSources: res.sources,
          error: res.status === 'ai_unavailable'
        }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "Sorry, I couldn't connect to the server right now.",
        error: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  const renderFormatting = (text) => {
    return text.split('**').map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: 'var(--color-primary-dark)' }}>{part}</strong>
        : part
    );
  };

  const SUGGESTIONS = [
    { icon: <Leaf size={14} color="var(--color-primary)" />, text: "How can I reduce my travel footprint?" },
    { icon: <BarChart2 size={14} color="#3B82F6" />, text: "What's my biggest emission source this month?" },
    { icon: <Car size={14} color="#6B7280" />, text: "Compare bus vs electric car for 10km" },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 150px)' }}>

      {/* Main Chat Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              <Zap size={14} /> NEURAL ENVIRONMENTAL ENGINE V4.2
            </div>
            <h1 className="page-title" style={{ color: 'var(--color-primary-dark)' }}>PlanetPulse Climate Assistant</h1>
            <p className="page-subtitle">Ask anything about your carbon data, sustainable switches, or emission factors.</p>
          </div>
          <div className="badge badge-gray" style={{ background: '#E5E7EB' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-muted)', marginRight: '0.5rem' }}></div>
            GHG Protocol Mode: Scope 1-3
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} color="var(--color-text-muted)" />
            <div>
              <strong>AI Insights</strong> • <span style={{ color: 'var(--color-text-muted)' }}>Powered by your real logged activities</span>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>If AI is unavailable, your carbon calculations remain fully functional.</div>
            </div>
          </div>
          <div className="badge badge-mint" style={{ background: 'var(--color-primary-light)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', marginRight: '0.5rem' }}></div>
            Status: Operational
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="label-sm">SUGGESTED EXPLORATION PROMPTS</div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {SUGGESTIONS.map((p, i) => (
            <div
              key={i}
              onClick={() => handleSuggestion(p.text)}
              style={{ background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-pill)', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
            >
              {p.icon} {p.text}
            </div>
          ))}
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>

          {messages.length === 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.25rem' }}>
                <Leaf size={32} color="var(--color-primary-dark)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Ask me anything</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '340px', lineHeight: 1.6 }}>Try one of the suggestions above, or type your own question about your carbon footprint.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {msg.role === 'user' ? 'You' : 'PlanetPulse AI'} - {msg.time}
                {msg.badge && (
                  <span className="badge badge-gray" style={{ background: 'white', border: '1px solid #E5E7EB', fontSize: '0.65rem' }}>
                    <CheckCircle2 size={10} style={{ marginRight: '0.25rem' }} /> {msg.badge}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '85%' }}>
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
                  background: msg.role === 'user' ? 'var(--color-primary-dark)' : msg.error ? '#FEF2F2' : 'var(--color-bg-base)',
                  color: msg.role === 'user' ? 'white' : msg.error ? '#991B1B' : 'var(--color-text-main)',
                  border: msg.role === 'ai' ? `1px solid ${msg.error ? '#FECACA' : '#E5E7EB'}` : 'none',
                  boxShadow: msg.role === 'ai' ? 'var(--shadow-sm)' : 'none',
                  fontSize: '0.95rem',
                  lineHeight: 1.6
                }}>
                  <div>{renderFormatting(msg.content)}</div>

                  {(msg.rawSources) && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                      <div className="label-sm" style={{ marginBottom: '0.75rem' }}>VERIFIED METHODOLOGY CITATIONS</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {msg.rawSources.map((s, idx) => (
                          <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="badge badge-gray" style={{ background: 'white', border: '1px solid #E5E7EB', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={16} />
              </div>
              <div style={{ padding: '1rem', background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: '16px', borderTopLeftRadius: '4px', display: 'flex', alignItems: 'center' }}>
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ position: 'relative' }}>
          <form onSubmit={handleSend} style={{ background: 'var(--color-bg-base)', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
            <input
              type="text"
              placeholder="Ask about your emissions, travel alternatives..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.95rem', outline: 'none', color: 'var(--color-text-main)' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Mic size={18} /></button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{ background: 'var(--color-primary-dark)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!input.trim() || loading) ? 0.5 : 1 }}
            >
              <Send size={16} />
            </button>
          </form>
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Lock size={12} /> Private &amp; Anonymized • Press Enter to send</span>
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>

        <div className="card" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-mint-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--color-primary-dark)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}><Leaf size={18} /></div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Your Carbon Context</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
            The AI has full access to your logged activities. Ask about your totals, trends, or any specific day — it will pull your real data.
          </p>
          <a href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn btn-light" style={{ width: '100%', fontSize: '0.85rem' }}>View Dashboard &rarr;</button>
          </a>
        </div>

        <div className="card" style={{ background: 'var(--color-bg-base)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>What-If Simulator</h3>
            <div style={{ color: 'var(--color-text-muted)' }}><Zap size={14} /></div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Model hypothetical lifestyle changes — like switching to the bus or cutting meat — to see the real CO₂ impact before you commit.
          </p>
          <a href="/what-if" style={{ textDecoration: 'none' }}>
            <button className="btn btn-light" style={{ width: '100%', fontSize: '0.85rem', background: 'var(--color-bg-subtle)' }}>Open What-If Simulator &rarr;</button>
          </a>
        </div>

        <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0', display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
            <CheckCircle2 size={20} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-primary-dark)' }}>Scientific Integrity Guarantee</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>CO₂ is always calculated by the backend engine using IPCC AR6 fixed factors, never by the AI.</div>
          </div>
        </div>

      </div>
    </div>
  );
}
