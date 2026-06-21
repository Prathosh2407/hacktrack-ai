import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, daysUntil } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const markRead = async (id) => {
    await api.markReminderRead(id);
    setData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard…</div>;

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your hackathons, internships, and tasks.</p>
        </div>
      </header>

      {data.reminders?.length > 0 && (
        <section className="reminder-banner">
          <h3>🔔 Reminders</h3>
          <ul>
            {data.reminders.map((r) => (
              <li key={r.id}>
                <span>{r.message}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markRead(r.id)}>
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>Upcoming Hackathons</h2>
            <Link to="/hackathons" className="link-sm">View all</Link>
          </div>
          {data.upcoming.length === 0 ? (
            <EmptyState title="No upcoming hackathons" description="Add a hackathon to track deadlines." />
          ) : (
            <ul className="item-list">
              {data.upcoming.map((h) => (
                <li key={h.id} className="item-row">
                  <div>
                    <strong>{h.name}</strong>
                    <small>Deadline: {formatDate(h.registration_deadline)}</small>
                  </div>
                  <span className={`countdown ${daysUntil(h.registration_deadline) <= 3 ? 'urgent' : ''}`}>
                    {daysUntil(h.registration_deadline)}d left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Registered Hackathons</h2>
            <Link to="/hackathons" className="link-sm">Manage</Link>
          </div>
          {data.registered.length === 0 ? (
            <EmptyState title="None registered yet" />
          ) : (
            <ul className="item-list">
              {data.registered.map((h) => (
                <li key={h.id} className="item-row">
                  <div>
                    <strong>{h.name}</strong>
                    <small>Event: {formatDate(h.event_date)}</small>
                  </div>
                  <StatusBadge status={h.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Internship Applications</h2>
            <Link to="/internships" className="link-sm">View all</Link>
          </div>
          {data.internships.length === 0 ? (
            <EmptyState title="No applications yet" />
          ) : (
            <ul className="item-list">
              {data.internships.map((i) => (
                <li key={i.id} className="item-row">
                  <div>
                    <strong>{i.company}</strong>
                    <small>{i.role} · Applied {formatDate(i.applied_date)}</small>
                  </div>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Today's Tasks</h2>
            <Link to="/tasks" className="link-sm">Manage</Link>
          </div>
          {data.tasks.length === 0 ? (
            <EmptyState title="No tasks for today" description="Add daily tasks to stay on track." />
          ) : (
            <ul className="item-list">
              {data.tasks.map((t) => (
                <li key={t.id} className={`item-row ${t.completed ? 'completed' : ''}`}>
                  <div>
                    <strong>{t.title}</strong>
                    {t.description && <small>{t.description}</small>}
                  </div>
                  <span className="task-check">{t.completed ? '✓' : '○'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
