import { useState } from 'react';
import { setWeeklyTarget } from '../api';
import { Target } from 'lucide-react';

export default function TargetForm({ currentTarget, onSuccess, onClose }) {
  const [value, setValue] = useState(currentTarget ? String(currentTarget) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const kg = parseFloat(value);
    if (isNaN(kg) || kg <= 0) { setError('Please enter a valid positive number.'); return; }
    if (kg > 10000) { setError('Target cannot exceed 10,000 kg.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await setWeeklyTarget(kg);
      if (onSuccess) onSuccess(kg);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', background: 'white' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '0.75rem', borderRadius: '50%' }}>
            <Target size={22}/>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{currentTarget ? 'Update' : 'Set'} Weekly Target</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>How many kg CO₂ do you want to stay under this week?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Weekly target (kg CO₂)</label>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <input
                type="number"
                min="0.01"
                max="10000"
                step="0.01"
                className="form-control"
                style={{ flex: 1, fontSize: '1.5rem', fontWeight: 800, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="e.g. 50"
                autoFocus
              />
              <div style={{ background: 'var(--color-primary-dark)', color: 'white', padding: '0 1rem', display: 'flex', alignItems: 'center', borderTopRightRadius: 'var(--radius-input)', borderBottomRightRadius: 'var(--radius-input)', fontWeight: 700 }}>
                kg CO₂
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-light" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
