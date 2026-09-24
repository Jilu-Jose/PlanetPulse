export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// â”€â”€â”€ Session & Headers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const fetchDashboard = (range = 'week') =>
  apiCall(`${API_BASE_URL}/dashboard?range=${range}`);

// â”€â”€â”€ Meta / Factors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const fetchMeta = () => apiCall(`${API_BASE_URL}/meta/factors`);

// â”€â”€â”€ Activities (Feature 1, Feature 5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Weekly Target (Feature 4) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ AI / Phase 8 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// Phase 8A Quick Log
export const parseActivities = (text, source = 'text') =>
  apiCall(`${API_BASE_URL}/activities/parse`, {
    method: 'POST',
    body: JSON.stringify({ text, source }),
  });

export const previewActivity = (activity_type, quantity, occurred_on = null) =>
  apiCall(`${API_BASE_URL}/activities/preview`, {
    method: 'POST',
    body: JSON.stringify({ activity_type, quantity, occurred_on, confirm_unusual: false }),
  });

export const batchLogActivities = (items, source = 'text') =>
  apiCall(`${API_BASE_URL}/activities/batch`, {
    method: 'POST',
    body: JSON.stringify({ source, items }),
  });

// --- Map API ---
export async function fetchProfile() {
  const res = await fetch(`${API_BASE_URL}/profile`, { headers: getHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updateProfile(region_id, share_to_map) {
  const res = await fetch(`${API_BASE_URL}/profile/region`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ region_id, share_to_map }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function fetchMapRegions(offset = 0) {
  const res = await fetch(`${API_BASE_URL}/map/regions?offset=${offset}`, { headers: getHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function fetchMapMe() {
  const res = await fetch(`${API_BASE_URL}/map/me`, { headers: getHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}
