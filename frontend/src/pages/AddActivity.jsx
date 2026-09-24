import { useState, useEffect } from 'react';
import {
  Car, Bus, Plane, Zap, Leaf, Beef,
  CheckCircle2, AlertCircle, AlertTriangle, Calculator, Wand2
} from 'lucide-react';
import QuickLogCard from '../components/QuickLogCard';
import ReviewPanel from '../components/ReviewPanel';
import { addActivity, fetchMeta, parseActivities, batchLogActivities } from '../api';

const ACTIVITY_META = {
  car:          { icon: <Car size={22}/>,   label: 'Car',                 category: 'travel', unit: 'km',   desc: 'Passenger car trip' },
  bus:          { icon: <Bus size={22}/>,   label: 'Bus',                 category: 'travel', unit: 'km',   desc: 'Local or transit bus' },
  flight:       { icon: <Plane size={22}/>, label: 'Flight',              category: 'travel', unit: 'km',   desc: 'Commercial flight' },
  electricity:  { icon: <Zap size={22}/>,   label: 'Electricity',         category: 'energy', unit: 'kWh',  desc: 'Grid electricity' },
  veg_meal:     { icon: <Leaf size={22}/>,  label: 'Vegetarian Meal',     category: 'food',   unit: 'meal', desc: 'Plant-based meal', integer: true },
  non_veg_meal: { icon: <Beef size={22}/>,  label: 'Non-Veg Meal',        category: 'food',   unit: 'meal', desc: 'Meal with meat',   integer: true },
};

const CATEGORY_LABELS = { travel: 'Travel', energy: 'Energy', food: 'Food' };
const CATEGORY_ORDER = ['travel', 'energy', 'food'];

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function AddActivity({ onActivityAdded }) {
  const [activityType, setActivityType] = useState('car');
  const [quantity, setQuantity] = useState('');
  const [occurredOn, setOccurredOn] = useState(getTodayISO());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message }
  
  // Phase 8A Tab State
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'form'
  
  // Phase 8A Quick Log state
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);
  const [unsupportedItems, setUnsupportedItems] = useState([]);
  const [totalPreviewKg, setTotalPreviewKg] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [quickLogSource, setQuickLogSource] = useState('text');

  const meta = ACTIVITY_META[activityType];

  const handleSubmit = async (e, confirmUnusual = false) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError(null);
    setConfirmDialog(null);

    try {
      const data = await addActivity({
        activity_type: activityType,
        quantity: Number(quantity),
        occurred_on: occurredOn,
        confirm_unusual: confirmUnusual,
      });
      setResult(data);
      setQuantity('');
      if (onActivityAdded) onActivityAdded();
    } catch (err) {
      const detail = err.detail;
      if (err.status === 409 && detail?.code === 'needs_confirmation') {
        setConfirmDialog(detail.message);
      } else {
        setError(detail?.message || err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Group activities by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = Object.entries(ACTIVITY_META).filter(([, m]) => m.category === cat);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Record New Activity</h1>
        <p className="page-subtitle">Log a travel, energy or food activity to track your carbon footprint.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('quick')}
          className={`flex items-center gap-2 pb-2 px-2 transition-colors relative font-semibold ${activeTab === 'quick' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Wand2 size={18} /> Quick log
          {activeTab === 'quick' && <div className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-emerald-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 pb-2 px-2 transition-colors relative font-semibold ${activeTab === 'form' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Calculator size={18} /> Manual form
          {activeTab === 'form' && <div className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-emerald-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'quick' && (
        <div style={{ marginBottom: '2rem' }}>
          {!showReview ? (
            <QuickLogCard onParse={async (text, source) => {
              setIsParsing(true);
              setQuickLogSource(source);
              try {
                const res = await parseActivities(text, source);
                setParsedItems(res.items);
                setUnsupportedItems(res.unsupported);
                setTotalPreviewKg(res.total_preview_kg);
                setShowReview(true);
              } catch (err) {
                alert(`Parsing failed: ${err.message}`);
              } finally {
                setIsParsing(false);
              }
            }} isParsing={isParsing} />
          ) : (
            <ReviewPanel
              items={parsedItems}
              unsupported={unsupportedItems}
              totalKg={totalPreviewKg}
              onUpdateItem={(id, updatedItem) => {
                setParsedItems(prev => prev.map(i => i.id === id ? updatedItem : i));
                setTotalPreviewKg(parsedItems.reduce((acc, curr) => {
                  const item = curr.id === id ? updatedItem : curr;
                  return acc + (item.co2e_kg && (item.status === 'ok' || item.status === 'needs_confirmation') ? item.co2e_kg : 0);
                }, 0));
              }}
              onRemoveItem={(id) => setParsedItems(prev => prev.filter(i => i.id !== id))}
              onConfirm={async () => {
                setIsSubmittingQuick(true);
                try {
                  const itemsToLog = parsedItems.filter(i => (i.status === 'ok' || (i.status === 'needs_confirmation' && i.confirm_unusual)) && i.co2e_kg !== null);
                  if (itemsToLog.length === 0) return setShowReview(false);
                  
                  const payload = itemsToLog.map(i => ({
                    activity_type: i.activity_type,
                    quantity: i.quantity,
                    occurred_on: i.occurred_on,
                    confirm_unusual: !!i.confirm_unusual
                  }));
                  
                  await batchLogActivities(payload, quickLogSource);
                  
                  setShowReview(false);
                  setParsedItems([]);
                  if (onActivityAdded) onActivityAdded();
                } catch (err) {
                  alert(`Failed to log activities: ${err.message}`);
                } finally {
                  setIsSubmittingQuick(false);
                }
              }}
              onCancel={() => setShowReview(false)}
              isSubmitting={isSubmittingQuick}
            />
          )}
        </div>
      )}

      {activeTab === 'form' && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>

        {/* Activity Selector */}
        {CATEGORY_ORDER.map(cat => (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <div className="label-sm" style={{ marginBottom: '0.75rem' }}>{CATEGORY_LABELS[cat].toUpperCase()}</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {grouped[cat].map(([type, m]) => {
                const active = activityType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => { setActivityType(type); setQuantity(''); setResult(null); setError(null); }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                      padding: '0.85rem 1.25rem', borderRadius: '16px', cursor: 'pointer',
                      border: `2px solid ${active ? 'var(--color-primary-dark)' : '#E5E7EB'}`,
                      background: active ? 'var(--color-primary-dark)' : 'var(--color-bg-subtle)',
                      color: active ? 'white' : 'var(--color-text-main)',
                      transition: 'all 0.15s', fontWeight: 600, fontSize: '0.85rem', minWidth: '90px'
                    }}
                  >
                    <span style={{ color: active ? 'white' : 'var(--color-primary)' }}>{m.icon}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Selected info */}
        <div style={{
          background: 'var(--color-primary-light)', border: '1px solid var(--color-mint-border)',
          borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
          fontSize: '0.85rem', color: 'var(--color-primary-dark)', display: 'flex', gap: '0.5rem', alignItems: 'center'
        }}>
          <CheckCircle2 size={16}/> <strong>{meta.label}</strong> — {meta.desc} &nbsp;·&nbsp; Unit: <strong>{meta.unit}</strong>
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label className="form-label">
            Quantity ({meta.unit})
            {meta.integer && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> — whole numbers only</span>}
          </label>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
            <input
              type="number"
              min={meta.integer ? '1' : '0.01'}
              step={meta.integer ? '1' : '0.01'}
              className="form-control"
              style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, fontSize: '1.25rem', fontWeight: 700 }}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder={meta.integer ? 'e.g. 2' : 'e.g. 25.00'}
              required
            />
            <div style={{
              background: 'var(--color-primary-dark)', color: 'white', padding: '0 1.25rem',
              display: 'flex', alignItems: 'center', borderTopRightRadius: 'var(--radius-input)',
              borderBottomRightRadius: 'var(--radius-input)', fontWeight: 700, fontSize: '0.95rem'
            }}>
              {meta.unit}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={occurredOn}
            onChange={e => setOccurredOn(e.target.value)}
            max={getTodayISO()}
            style={{ background: 'var(--color-bg-subtle)', border: 'none' }}
          />
        </div>

        {/* Errors */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', color: '#991B1B', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }}/> {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1rem' }} disabled={submitting}>
          <Calculator size={18}/> {submitting ? 'Calculating…' : 'Calculate & Log Activity'}
        </button>
      </form>
      )}

      {/* DP2 Confirmation Dialog */}
      {confirmDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', background: 'white' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#FEF3C7', color: '#B45309', padding: '0.75rem', borderRadius: '50%', flexShrink: 0 }}>
                <AlertTriangle size={24}/>
              </div>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Unusual Entry Detected</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{confirmDialog}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-light" style={{ flex: 1 }} onClick={() => setConfirmDialog(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit(null, true)}>
                Yes, log it anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {result && (
        <div className="animate-fade-in card" style={{ border: '2px solid var(--color-mint-border)', background: 'var(--color-primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'var(--color-primary-dark)', color: 'white', padding: '0.6rem', borderRadius: '50%' }}>
                <CheckCircle2 size={22}/>
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Activity recorded!</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {result.flagged_unusual && <span style={{ color: '#B45309', fontWeight: 600 }}>⚠ Unusual entry flagged · </span>}
                  {result.occurred_on}
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div className="label-sm" style={{ marginBottom: '0.5rem' }}>CARBON EMITTED</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1 }}>
              {result.co2e_kg.toFixed(2)}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>kg CO₂</div>
          </div>

          <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            {result.formula_string}
          </div>

          {/* DP1: target_status_change nudge */}
          {result.target_status_change?.crossed && (
            <div style={{ marginTop: '1rem', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '10px', padding: '1rem', fontSize: '0.85rem', color: '#92400E', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }}/> You've just crossed your weekly carbon target!
            </div>
          )}

          <button
            className="btn btn-light"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => { setResult(null); }}
          >
            Log another activity
          </button>
        </div>
      )}
      
      {/* End form content block */}
    </div>
  );
}
