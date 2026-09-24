import { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, AlertTriangle, Leaf, Edit3 } from 'lucide-react';
import TargetForm from './TargetForm';

function PaceChip({ pace }) {
  const cfg = {
    ahead:   { label: 'Ahead of pace', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', icon: <TrendingDown size={13}/> },
    on_pace: { label: 'On pace',        color: '#6B7280',              bg: '#F3F4F6',                    icon: <Minus size={13}/> },
    behind:  { label: 'Behind pace',    color: '#D97706',              bg: '#FEF3C7',                    icon: <TrendingUp size={13}/> },
  }[pace];
  if (!cfg) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: cfg.bg, color: cfg.color, borderRadius: 'var(--radius-pill)', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatusChip({ status }) {
  const cfg = {
    on_track:   { label: 'On track',   bg: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' },
    approaching:{ label: 'Approaching',bg: '#FEF3C7',                    color: '#B45309' },
    exceeded:   { label: 'Exceeded',   bg: '#FEE2E2',                    color: '#991B1B' },
    no_target:  { label: 'No target',  bg: '#F3F4F6',                    color: '#6B7280' },
  }[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' };

  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 'var(--radius-pill)', padding: '0.3rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}>
      {cfg.label}
    </span>
  );
}

export default function WeeklyTargetCard({ progress, onRefresh }) {
  const [showForm, setShowForm] = useState(false);

  if (!progress) return null;

  const {
    status, target_kg, used_kg, remaining_kg, percent_used,
    expected_kg_by_now, pace, days_remaining, exceeded_by_kg,
    top_contributor, suggestion, budget_per_remaining_day_kg,
    week_start, week_end
  } = progress;

  const noTarget = status === 'no_target';
  const pct = Math.min(100, percent_used || 0);
  const barColor = status === 'exceeded' ? '#DC2626' : status === 'approaching' ? '#F59E0B' : 'var(--color-primary)';

  return (
    <>
      <div className="card" style={{ border: status === 'exceeded' ? '2px solid #FECACA' : '1px solid var(--color-mint-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '0.6rem', borderRadius: '10px' }}>
              <Target size={20}/>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Weekly Target</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{week_start} → {week_end}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusChip status={status}/>
            <button
              onClick={() => setShowForm(true)}
              style={{ background: 'var(--color-bg-subtle)', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              title="Set target"
            >
              <Edit3 size={16}/>
            </button>
          </div>
        </div>

        {noTarget ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Set a weekly carbon target to track your progress.
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Target size={16}/> Set weekly target
            </button>
          </div>
        ) : (
          <>
            {/* Numbers row */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div>
                <div className="label-sm" style={{ marginBottom: '0.2rem' }}>USED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{used_kg?.toFixed(2)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>kg CO₂</div>
              </div>
              <div>
                <div className="label-sm" style={{ marginBottom: '0.2rem' }}>TARGET</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{target_kg?.toFixed(2)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>kg CO₂</div>
              </div>
              <div>
                <div className="label-sm" style={{ marginBottom: '0.2rem' }}>{remaining_kg >= 0 ? 'REMAINING' : 'OVER BY'}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: remaining_kg < 0 ? '#DC2626' : 'var(--color-primary-dark)' }}>
                  {remaining_kg < 0 ? exceeded_by_kg?.toFixed(2) : remaining_kg?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>kg CO₂</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="label-sm" style={{ marginBottom: '0.2rem' }}>PROGRESS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: barColor }}>{percent_used?.toFixed(0)}%</div>
                {pace && <PaceChip pace={pace}/>}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <div style={{ height: '10px', background: '#F3F4F6', borderRadius: '5px', overflow: 'visible', position: 'relative' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '5px', transition: 'width 0.5s ease' }}/>
                {/* Expected pace tick */}
                {expected_kg_by_now && target_kg && (
                  <div style={{
                    position: 'absolute', top: '-4px', bottom: '-4px',
                    left: `${Math.min(100, (expected_kg_by_now / target_kg) * 100)}%`,
                    width: '2px', background: '#9CA3AF', borderRadius: '1px',
                    transform: 'translateX(-50%)'
                  }} title={`Expected by now: ${expected_kg_by_now?.toFixed(2)} kg`}/>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              <span>0 kg</span>
              {expected_kg_by_now && <span>Expected: {expected_kg_by_now?.toFixed(2)} kg</span>}
              <span>Target: {target_kg?.toFixed(2)} kg</span>
            </div>

            {/* Status messages (DP1) */}
            {status === 'approaching' && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#92400E', marginBottom: '1rem' }}>
                <strong>Heads up:</strong> You've used {percent_used?.toFixed(0)}% of your weekly target. {remaining_kg?.toFixed(2)} kg left for {days_remaining} day{days_remaining !== 1 ? 's' : ''} (~{budget_per_remaining_day_kg?.toFixed(2)} kg/day).
              </div>
            )}

            {status === 'exceeded' && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#991B1B', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }}/>
                  <span><strong>You're {exceeded_by_kg?.toFixed(2)} kg over your weekly target.</strong>{top_contributor && ` Top contributor: ${top_contributor.type} (${top_contributor.kg} kg).`}</span>
                </div>
                {suggestion && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#6B7280' }}>
                    <Leaf size={14} style={{ flexShrink: 0, marginTop: '2px' }}/>
                    <span>💡 {suggestion.text}</span>
                  </div>
                )}
              </div>
            )}

            {days_remaining > 0 && budget_per_remaining_day_kg !== null && status !== 'exceeded' && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span>{days_remaining} day{days_remaining !== 1 ? 's' : ''} remaining ·</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{budget_per_remaining_day_kg?.toFixed(2)} kg/day</span>
                <span>budget</span>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <TargetForm
          currentTarget={target_kg}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); if (onRefresh) onRefresh(); }}
        />
      )}
    </>
  );
}
