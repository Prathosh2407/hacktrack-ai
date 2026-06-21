import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_COLORS = {
  hackathon_deadline: 'cal-deadline',
  hackathon_event: 'cal-event',
  internship: 'cal-internship',
  task: 'cal-task',
};

export default function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getCalendar(month, year)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [month, year]);

  const eventsByDate = useMemo(() => {
    if (!data) return {};
    const map = {};

    const add = (date, event) => {
      if (!date) return;
      if (!map[date]) map[date] = [];
      map[date].push(event);
    };

    data.hackathons?.forEach((h) =>
      add(h.registration_deadline, { type: 'hackathon_deadline', label: `${h.name} (deadline)`, ...h })
    );
    data.events?.forEach((h) =>
      add(h.event_date, { type: 'hackathon_event', label: `${h.name} (event)`, ...h })
    );
    data.internships?.forEach((i) =>
      add(i.date, { type: 'internship', label: `${i.name} – ${i.role}`, ...i })
    );
    data.tasks?.forEach((t) =>
      add(t.date, { type: 'task', label: t.name, completed: t.completed, ...t })
    );

    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const dateKey = (day) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isToday = (day) =>
    day &&
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  const selectedEvents = selectedDay ? eventsByDate[dateKey(selectedDay)] || [] : [];

  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="calendar-page">
      <header className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="page-subtitle">Deadlines, events, internships, and tasks at a glance.</p>
        </div>
        <div className="calendar-nav">
          <button type="button" className="btn btn-ghost" onClick={prevMonth}>←</button>
          <strong>{MONTHS[month - 1]} {year}</strong>
          <button type="button" className="btn btn-ghost" onClick={nextMonth}>→</button>
        </div>
      </header>

      <div className="calendar-layout">
        <div className="card calendar-grid-wrap">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day, idx) => {
              const key = day ? dateKey(day) : `empty-${idx}`;
              const dayEvents = day ? eventsByDate[key] || [] : [];
              return (
                <button
                  key={key}
                  type="button"
                  className={`cal-cell ${day ? '' : 'empty'} ${isToday(day) ? 'today' : ''} ${selectedDay === day ? 'selected' : ''}`}
                  onClick={() => day && setSelectedDay(day)}
                  disabled={!day}
                >
                  {day && <span className="cal-day-num">{day}</span>}
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span key={i} className={`cal-dot ${TYPE_COLORS[ev.type]}`} title={ev.label} />
                  ))}
                  {dayEvents.length > 3 && <span className="cal-more">+{dayEvents.length - 3}</span>}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span><i className="cal-dot cal-deadline" /> Deadline</span>
            <span><i className="cal-dot cal-event" /> Event</span>
            <span><i className="cal-dot cal-internship" /> Internship</span>
            <span><i className="cal-dot cal-task" /> Task</span>
          </div>
        </div>

        <aside className="card calendar-detail">
          <h2>
            {selectedDay
              ? `${MONTHS[month - 1]} ${selectedDay}, ${year}`
              : 'Select a day'}
          </h2>
          {selectedDay && selectedEvents.length === 0 && (
            <p className="muted">No events on this day.</p>
          )}
          <ul className="cal-event-list">
            {selectedEvents.map((ev, i) => (
              <li key={i} className={TYPE_COLORS[ev.type]}>
                <span className="cal-event-type">{ev.type.replace(/_/g, ' ')}</span>
                <strong>{ev.label}</strong>
                {ev.status && <small>Status: {ev.status}</small>}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
