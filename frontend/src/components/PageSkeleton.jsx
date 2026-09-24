// Reusable skeleton building blocks + full-page skeleton layouts

function SkeletonBlock({ width = '100%', height = '1rem', radius = '6px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/** Full-page skeleton for the Dashboard */
export function DashboardSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero number */}
      <SkeletonBlock width="50%" height="3rem" radius="10px" style={{ marginBottom: '0.75rem' }} />
      <SkeletonBlock width="30%" height="1rem" style={{ marginBottom: '2rem' }} />

      {/* Range pills */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        {[80, 90, 60].map((w, i) => (
          <SkeletonBlock key={i} width={`${w}px`} height="2rem" radius="999px" />
        ))}
      </div>

      {/* Card row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
            <SkeletonBlock width="40%" height="0.75rem" style={{ marginBottom: '1rem' }} />
            <SkeletonBlock width="60%" height="2rem" style={{ marginBottom: '0.5rem' }} />
            <SkeletonBlock width="80%" height="0.75rem" />
          </div>
        ))}
      </div>

      {/* Chart + breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
          <SkeletonBlock width="40%" height="1rem" style={{ marginBottom: '1.5rem' }} />
          <SkeletonBlock width="180px" height="180px" radius="50%" style={{ margin: '0 auto' }} />
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
          <SkeletonBlock width="40%" height="1rem" style={{ marginBottom: '1.5rem' }} />
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <SkeletonBlock width="32px" height="32px" radius="8px" />
              <div style={{ flex: 1 }}>
                <SkeletonBlock width="60%" height="0.75rem" style={{ marginBottom: '0.4rem' }} />
                <SkeletonBlock width="80%" height="0.5rem" radius="999px" />
              </div>
              <SkeletonBlock width="50px" height="0.75rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Full-page skeleton for the History page */
export function HistorySkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <SkeletonBlock width="200px" height="2rem" radius="8px" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBlock width="300px" height="1rem" style={{ marginBottom: '2rem' }} />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[70, 60, 80, 65, 90, 75].map((w, i) => (
          <SkeletonBlock key={i} width={`${w}px`} height="2rem" radius="999px" />
        ))}
      </div>

      {/* Summary bar */}
      <SkeletonBlock width="100%" height="3.5rem" radius="12px" style={{ marginBottom: '1.5rem' }} />

      {/* Table rows */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6' }}>
            <SkeletonBlock width="32px" height="32px" radius="8px" />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="40%" height="0.85rem" style={{ marginBottom: '0.4rem' }} />
              <SkeletonBlock width="25%" height="0.7rem" />
            </div>
            <SkeletonBlock width="70px" height="1rem" />
            <SkeletonBlock width="24px" height="24px" radius="6px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-page skeleton for AddActivity */
export function AddActivitySkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <SkeletonBlock width="220px" height="2rem" radius="8px" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBlock width="320px" height="1rem" style={{ marginBottom: '2rem' }} />

      {/* Form card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E7EB' }}>
        <SkeletonBlock width="100%" height="3rem" radius="12px" style={{ marginBottom: '1.25rem' }} />
        <SkeletonBlock width="100%" height="3rem" radius="12px" style={{ marginBottom: '1.25rem' }} />
        <SkeletonBlock width="100%" height="3rem" radius="12px" style={{ marginBottom: '2rem' }} />
        <SkeletonBlock width="120px" height="2.75rem" radius="999px" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );
}

/** Generic simple skeleton (e.g. for WhatIf or AskAI) */
export function GenericPageSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <SkeletonBlock width="240px" height="2rem" radius="8px" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBlock width="380px" height="1rem" style={{ marginBottom: '2rem' }} />
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E7EB' }}>
        {[1, 2, 3].map(i => (
          <SkeletonBlock key={i} width={`${100 - i * 10}%`} height="1rem" style={{ marginBottom: '0.75rem' }} />
        ))}
      </div>
    </div>
  );
}

export default SkeletonBlock;
