import { useState, useEffect } from 'react';
import { fetchActivities, deleteActivity } from '../api';
import { Trash2, Car, Bus, Plane, Zap, Leaf, Beef, AlertTriangle, FilterX, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const TYPE_ICONS = {
  car: <Car size={16}/>, bus: <Bus size={16}/>, flight: <Plane size={16}/>,
  electricity: <Zap size={16}/>, veg_meal: <Leaf size={16}/>, non_veg_meal: <Beef size={16}/>
};
const TYPE_LABELS = {
  car: 'Car', bus: 'Bus', flight: 'Flight',
  electricity: 'Electricity', veg_meal: 'Veg Meal', non_veg_meal: 'Non-Veg Meal'
};
const ALL_TYPES = Object.keys(TYPE_LABELS);

function getThisWeekRange() {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  return {
    date_from: monday.toISOString().split('T')[0],
    date_to: now.toISOString().split('T')[0],
  };
}

function getLast7Days() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 6);
  return { date_from: from.toISOString().split('T')[0], date_to: now.toISOString().split('T')[0] };
}

function getThisMonth() {
  const now = new Date();
  return {
    date_from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    date_to: now.toISOString().split('T')[0],
  };
}

export default function History({ refreshKey }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, label }
  const [deleting, setDeleting] = useState(false);

  const hasFilters = selectedTypes.length > 0 || dateFrom || dateTo;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchActivities({
        types: selectedTypes.length ? selectedTypes : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: PER_PAGE,
      });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedTypes, dateFrom, dateTo, page, refreshKey]);

  const toggleType = (t) => {
    setPage(1);
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const applyPreset = (preset) => {
    setPage(1);
    if (preset === 'week') { const r = getThisWeekRange(); setDateFrom(r.date_from); setDateTo(r.date_to); }
    else if (preset === 'last7') { const r = getLast7Days(); setDateFrom(r.date_from); setDateTo(r.date_to); }
    else if (preset === 'month') { const r = getThisMonth(); setDateFrom(r.date_from); setDateTo(r.date_to); }
    else { setDateFrom(''); setDateTo(''); }
  };

  const clearFilters = () => { setSelectedTypes([]); setDateFrom(''); setDateTo(''); setPage(1); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteActivity(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 1;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Activity History</h1>
          <p className="page-subtitle">Review, filter and delete your logged activities.</p>
        </div>
        {data && (
          <div style={{ background: 'var(--color-primary-light)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-mint-border)', textAlign: 'right' }}>
            <div className="label-sm">FILTERED TOTAL</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              {data.total_kg?.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>kg CO₂</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{data.total} activities</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        {/* Type chips */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="label-sm" style={{ marginBottom: '0.5rem' }}>FILTER BY TYPE</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ALL_TYPES.map(t => {
              const active = selectedTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${active ? 'var(--color-primary-dark)' : '#E5E7EB'}`,
                    background: active ? 'var(--color-primary-dark)' : 'white',
                    color: active ? 'white' : 'var(--color-text-main)', transition: 'all 0.15s'
                  }}
                >
                  {TYPE_ICONS[t]} {TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="label-sm">PERIOD:</div>
          {[['week', 'This week'], ['last7', 'Last 7 days'], ['month', 'This month'], ['all', 'All time']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => applyPreset(k)} className="badge badge-gray" style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              {l}
            </button>
          ))}
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: 'var(--color-bg-subtle)', border: 'none' }}/>
          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: 'var(--color-bg-subtle)', border: 'none' }}/>
          {hasFilters && (
            <button onClick={clearFilters} className="badge badge-error" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem' }}>
              <FilterX size={14}/> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-error)' }}>
          <AlertCircle size={32} style={{ marginBottom: '1rem' }}/><br/>{error}
        </div>
      ) : !data?.items?.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Leaf size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}/>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
            {hasFilters ? 'No results for these filters' : 'No activities logged yet'}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {hasFilters
              ? <><button onClick={clearFilters} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Clear filters</button> to see all activities.</>
              : 'Go to Add Activity to log your first entry.'}
          </p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid #E5E7EB' }}>
                  {['Date', 'Type', 'Quantity', 'CO₂ (kg)', 'Formula', ''].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((act, i) => (
                  <tr key={act.id} style={{ borderBottom: i < data.items.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{act.occurred_on}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--color-primary)' }}>{TYPE_ICONS[act.activity_type]}</span>
                        {TYPE_LABELS[act.activity_type] || act.activity_type}
                        {act.flagged_unusual && <span className="badge badge-gray" style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.65rem' }}>unusual</span>}
                      </span>
                      {act.entry_method && act.entry_method !== 'form' && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', marginLeft: '1.5rem' }}>
                          via {act.entry_method}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{act.quantity} {act.unit}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary-dark)' }}>{act.co2e_kg?.toFixed(2)}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{act.formula_string}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => setDeleteTarget({ id: act.id, label: `${TYPE_LABELS[act.activity_type] || act.activity_type} on ${act.occurred_on}` })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem' }}
                        title="Delete"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-light" style={{ padding: '0.5rem 0.75rem' }}>
                <ChevronLeft size={18}/>
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-light" style={{ padding: '0.5rem 0.75rem' }}>
                <ChevronRight size={18}/>
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '380px', width: '100%', background: 'white' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: '50%', flexShrink: 0 }}><Trash2 size={22}/></div>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Delete activity?</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>"{deleteTarget.label}" will be permanently removed.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-light" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="btn"
                style={{ flex: 1, background: '#DC2626', color: 'white', border: 'none', borderRadius: 'var(--radius-pill)', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
