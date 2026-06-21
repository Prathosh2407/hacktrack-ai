import { useEffect, useState } from 'react';
import { api, formatDate, daysUntil } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const STATUSES = ['planning', 'registered', 'submitted', 'completed', 'rejected'];

const emptyForm = {
  name: '',
  registration_deadline: '',
  event_date: '',
  team_members: '',
  status: 'planning',
};

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .getHackathons()
      .then(setHackathons)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (h) => {
    setEditing(h);
    setForm({
      name: h.name,
      registration_deadline: h.registration_deadline,
      event_date: h.event_date,
      team_members: (h.team_members || []).join(', '),
      status: h.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      registration_deadline: form.registration_deadline,
      event_date: form.event_date,
      team_members: form.team_members
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      status: form.status,
    };

    try {
      if (editing) {
        await api.updateHackathon(editing.id, payload);
      } else {
        await api.createHackathon(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hackathon?')) return;
    await api.deleteHackathon(id);
    load();
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Hackathons</h1>
          <p className="page-subtitle">Track deadlines, teams, and registration status.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add Hackathon
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : hackathons.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No hackathons yet"
            description="Add your first hackathon to start receiving deadline reminders."
          />
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Deadline</th>
                <th>Event Date</th>
                <th>Team</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hackathons.map((h) => (
                <tr key={h.id}>
                  <td>
                    <strong>{h.name}</strong>
                    {daysUntil(h.registration_deadline) >= 0 && daysUntil(h.registration_deadline) <= 7 && (
                      <small className="urgent-text"> · {daysUntil(h.registration_deadline)}d to deadline</small>
                    )}
                  </td>
                  <td>{formatDate(h.registration_deadline)}</td>
                  <td>{formatDate(h.event_date)}</td>
                  <td>{(h.team_members || []).join(', ') || '—'}</td>
                  <td><StatusBadge status={h.status} /></td>
                  <td className="actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(h)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Hackathon' : 'Add Hackathon'}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name *
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Hackathon name"
              required
            />
          </label>
          <label>
            Registration Deadline *
            <input
              type="date"
              value={form.registration_deadline}
              onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
              required
            />
          </label>
          <label>
            Event Date *
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              required
            />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="full-width">
            Team Members
            <input
              value={form.team_members}
              onChange={(e) => setForm({ ...form, team_members: e.target.value })}
              placeholder="Alice, Bob, Charlie (comma-separated)"
            />
          </label>
          <div className="form-actions full-width">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save Changes' : 'Add Hackathon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
