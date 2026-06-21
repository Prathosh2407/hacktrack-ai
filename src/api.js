const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getDashboard: () => request('/dashboard'),
  getCalendar: (month, year) => request(`/calendar?month=${month}&year=${year}`),

  getHackathons: () => request('/hackathons'),
  createHackathon: (body) => request('/hackathons', { method: 'POST', body: JSON.stringify(body) }),
  updateHackathon: (id, body) => request(`/hackathons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteHackathon: (id) => request(`/hackathons/${id}`, { method: 'DELETE' }),

  getInternships: () => request('/internships'),
  createInternship: (body) => request('/internships', { method: 'POST', body: JSON.stringify(body) }),
  updateInternship: (id, body) => request(`/internships/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteInternship: (id) => request(`/internships/${id}`, { method: 'DELETE' }),

  getTasks: (date) => request(date ? `/tasks?date=${date}` : '/tasks'),
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  getReminders: () => request('/reminders'),
  markReminderRead: (id) => request(`/reminders/${id}/read`, { method: 'PATCH' }),
  markAllRemindersRead: () => request('/reminders/read-all', { method: 'PATCH' }),
};

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}
