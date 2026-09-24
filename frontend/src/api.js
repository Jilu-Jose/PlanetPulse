export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── Session & Headers ───────────────────────────────────────────────────────

export const getSessionId = () => {
  let sessionId = localStorage.getItem('pp_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('pp_session_id', sessionId);
  }
  return sessionId;
};

export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Session-Id': getSessionId(),
  'X-Timezone': getUserTimezone(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiCall(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...getHeaders(), ...options.headers } });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.detail?.message || data?.detail || 'API error');
    err.status = res.status;
    err.detail = data?.detail;
    throw err;
  }
  return data;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const fetchDashboard = (range = 'week') =>
  apiCall(`${API_BASE_URL}/dashboard?range=${range}`);

// ─── Meta / Factors ──────────────────────────────────────────────────────────

export const fetchMeta = () => apiCall(`${API_BASE_URL}/meta/factors`);

// ─── Activities (Feature 1, Feature 5) ───────────────────────────────────────

export const addActivity = (payload) =>
  apiCall(`${API_BASE_URL}/activities`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchActivities = ({ types, date_from, date_to, page = 1, per_page = 20 } = {}) => {
  const params = new URLSearchParams({ page, per_page });
  if (types?.length) params.set('types', types.join(','));
  if (date_from) params.set('date_from', date_from);
  if (date_to) params.set('date_to', date_to);
  return apiCall(`${API_BASE_URL}/activities?${params}`);
};

export const deleteActivity = (id) =>
  fetch(`${API_BASE_URL}/activities/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  }).then(res => {
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
  });

// ─── Weekly Target (Feature 4) ───────────────────────────────────────────────

export const setWeeklyTarget = (target_kg) =>
  apiCall(`${API_BASE_URL}/target`, {
    method: 'PUT',
    body: JSON.stringify({ target_kg }),
  });

export const fetchTargetProgress = (week_start) => {
  const params = week_start ? `?week_start=${week_start}` : '';
  return apiCall(`${API_BASE_URL}/target/progress${params}`);
};

export const fetchPastWeeks = (count = 4) =>
  apiCall(`${API_BASE_URL}/target/weeks?count=${count}`);

// ─── AI / Phase 8 ────────────────────────────────────────────────────────────

export const askAI = async (question) => {
  try {
    return await apiCall(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  } catch {
    return { text: 'AI insights are temporarily unavailable. Your carbon calculations are still working.', sources: [], status: 'ai_unavailable' };
  }
};

export const calculateWhatIf = (payload) =>
  apiCall(`${API_BASE_URL}/what-if`, { method: 'POST', body: JSON.stringify(payload) });
