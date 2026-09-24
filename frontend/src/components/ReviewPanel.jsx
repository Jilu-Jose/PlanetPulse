import React from 'react';
import { AlertCircle, CheckCircle, Info, Trash2, HelpCircle } from 'lucide-react';
import { previewActivity } from '../api';

const ACTIVITY_OPTIONS = [
  { value: 'car', label: 'Car (km)' },
  { value: 'bus', label: 'Bus (km)' },
  { value: 'flight', label: 'Flight (km)' },
  { value: 'electricity', label: 'Electricity (kWh)' },
  { value: 'veg_meal', label: 'Veg Meal (count)' },
  { value: 'non_veg_meal', label: 'Non-Veg Meal (count)' },
];

export default function ReviewPanel({ 
  items, 
  unsupported, 
  totalKg, 
  onUpdateItem, 
  onRemoveItem, 
  onConfirm, 
  onCancel,
  isSubmitting 
}) {
  
  const handleItemChange = async (id, field, value) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const updated = { ...item, [field]: value };
    onUpdateItem(id, updated);
    
    if (updated.activity_type && updated.quantity > 0) {
      try {
        const preview = await previewActivity(updated.activity_type, updated.quantity, updated.occurred_on);
        onUpdateItem(id, {
          ...updated,
          co2e_kg: preview.co2e_kg,
          status: preview.status,
          message: preview.message,
          formula_string: preview.formula_string,
          needs_clarification: preview.needs_clarification,
          unit: preview.unit
        });
      } catch (err) {
        onUpdateItem(id, {
          ...updated,
          status: 'rejected',
          message: err.message || 'Validation error',
          co2e_kg: null
        });
      }
    }
  };

  const allOk = items.every(i => i.status === 'ok' || (i.status === 'needs_confirmation' && i.confirm_unusual));
  const hasItems = items.length > 0;
  const canSubmit = hasItems && allOk && !isSubmitting;

  return (
    <div className="card" style={{ marginTop: '1rem', padding: '1.5rem', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Review Activities</h3>
        {hasItems && (
          <span className="badge badge-mint" style={{ fontSize: '0.9rem', padding: '0.4rem 0.75rem' }}>
            {totalKg?.toFixed(2) || '0.00'} kg CO2e
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {items.map((item) => {
          let bg = '#F0FDF4'; let border = '#86EFAC';
          if (item.status === 'rejected') { bg = '#FEF2F2'; border = '#FECACA'; }
          else if (item.status === 'needs_input') { bg = '#FFFBEB'; border = '#FDE68A'; }
          else if (item.status === 'needs_confirmation') { bg = '#EFF6FF'; border = '#BFDBFE'; }

          return (
            <div key={item.id} style={{ padding: '1rem', borderRadius: '12px', border: `1px solid ${border}`, background: bg }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1 }}>
                  <div style={{ flex: '1 1 150px' }}>
                    <label className="label-sm" style={{ marginBottom: '0.25rem', display: 'block' }}>Activity</label>
                    <select 
                      className="form-control"
                      value={item.activity_type || ''}
                      onChange={(e) => handleItemChange(item.id, 'activity_type', e.target.value)}
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    >
                      <option value="" disabled>Select...</option>
                      {ACTIVITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label className="label-sm" style={{ marginBottom: '0.25rem', display: 'block' }}>Quantity</label>
                    <input 
                      type="number" step="any" min="0"
                      className="form-control"
                      value={item.quantity === null ? '' : item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label className="label-sm" style={{ marginBottom: '0.25rem', display: 'block' }}>Date</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={item.occurred_on || ''}
                      onChange={(e) => handleItemChange(item.id, 'occurred_on', e.target.value)}
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {item.co2e_kg !== null && item.co2e_kg !== undefined ? `${item.co2e_kg.toFixed(2)} kg` : '--'}
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '0.5rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                {item.status === 'rejected' && (
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#DC2626' }}>
                    <AlertCircle size={16} /> <span>{item.message}</span>
                  </div>
                )}
                {item.status === 'needs_input' && (
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#D97706' }}>
                    <HelpCircle size={16} /> <span>{item.message}</span>
                  </div>
                )}
                {item.status === 'needs_confirmation' && (
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#1D4ED8', alignItems: 'flex-start' }}>
                    <Info size={16} style={{ marginTop: '2px' }} />
                    <div>
                      <span style={{ display: 'block', marginBottom: '0.5rem' }}>{item.message}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                        <input 
                          type="checkbox"
                          checked={item.confirm_unusual || false}
                          onChange={(e) => handleItemChange(item.id, 'confirm_unusual', e.target.checked)}
                        />
                        Yes, this is correct
                      </label>
                    </div>
                  </div>
                )}
                {item.conversion_note && (
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>Note: {item.conversion_note}</p>
                )}
                {item.source_span && (
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '0.8rem', background: 'white', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-block', border: '1px solid #E5E7EB' }}>"{item.source_span}"</p>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
            No valid activities found to log.
          </div>
        )}
      </div>

      {unsupported?.length > 0 && (
        <div style={{ marginBottom: '1.5rem', background: '#F9FAFB', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} /> Unsupported Activities
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {unsupported.map((u, i) => (
              <li key={i}>
                <strong>{u.what}</strong>: {u.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
        <button 
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn btn-light"
          style={{ padding: '0.6rem 1.25rem' }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          disabled={!canSubmit}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          <CheckCircle size={16} />
          Log {items.length} Activity{items.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
