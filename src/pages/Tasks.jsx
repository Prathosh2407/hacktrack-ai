import { useEffect, useState } from 'react';
import { api, formatDate } from '../api';
import EmptyState from '../components/EmptyState';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (date) => {
    setLoading(true);
    api
      .getTasks(date)
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    try {
      await api.createTask({ title, description, due_date: selectedDate });
      setTitle('');
      setDescription('');
      load(selectedDate);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (id) => {
    await api.toggleTask(id);
    load(selectedDate);
  };

  const remove = async (id) => {
    await api.deleteTask(id);
    load(selectedDate);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Daily Tasks</h1>
          <p className="page-subtitle">
            {completedCount}/{tasks.length} completed for {formatDate(selectedDate)}
          </p>
        </div>
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card task-form-card">
        <form onSubmit={handleAdd} className="task-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task title…"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <button type="submit" className="btn btn-primary">Add Task</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <EmptyState title="No tasks for this day" />
        </div>
      ) : (
        <ul className="task-list card">
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <button type="button" className="task-toggle" onClick={() => toggle(task.id)}>
                {task.completed ? '✓' : '○'}
              </button>
              <div className="task-content">
                <strong>{task.title}</strong>
                {task.description && <small>{task.description}</small>}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(task.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
