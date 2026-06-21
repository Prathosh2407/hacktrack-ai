import { useEffect, useState } from 'react';
import { api, formatDate } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const STATUSES = ['applied', 'interview', 'offer', 'rejected', 'withdrawn'];

const emptyForm = {
  company: '',
  role: '',
  applied_date: '',
  status: 'applied',
};

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .getInternships()
      .then(setInternships)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      company: item.company,
      role: item.role,
      applied_date: item.applied_date,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.updateInternship(editing.id, form);
      } else {
        await api.createInternship(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;
    await api.deleteInternship(id);
    load();
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Internship Tracker</h1>
          <p className="page-subtitle">Monitor applications, interviews, and offers.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add Application
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : internships.length === 0 ? (
        <div className="card">
          <EmptyState title="No internship applications" description="Start tracking your job search here." />
        </div>
      ) : (
        <div className="cards-grid">
          {internships.map((item) => (
            <article key={item.id} className="card internship-card">
              <div className="card-top">
                <div>
                  <h3>{item.company}</h3>
                  <p className="role">{item.role}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="meta">Applied {formatDate(item.applied_date)}</p>
              <div className="card-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Application' : 'Add Application'}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Company *
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company name"
              required
            />
          </label>
          <label>
            Role *
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Software Engineer Intern"
              required
            />
          </label>
          <label>
            Applied Date *
            <input
              type="date"
              value={form.applied_date}
              onChange={(e) => setForm({ ...form, applied_date: e.target.value })}
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
          <div className="form-actions full-width">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
