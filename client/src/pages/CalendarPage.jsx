import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS = {
  interview:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
  deadline:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
  reminder:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
};

function toDateKey(dateVal) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const { addToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendarData() {
      try {
        const [appsRes, intsRes, remsRes] = await Promise.all([
          api.get('/applications'),
          api.get('/interviews'),
          api.get('/reminders'),
        ]);

        const combined = [];

        for (const app of appsRes.data.data) {
          if (app.deadline) {
            combined.push({
              id: `dl-${app.id}`,
              type: 'deadline',
              dateKey: toDateKey(app.deadline),
              label: `Deadline: ${app.companyName}`,
              applicationId: app.id,
            });
          }
        }

        for (const round of intsRes.data.data) {
          combined.push({
            id: `int-${round.id}`,
            type: 'interview',
            dateKey: toDateKey(round.scheduledAt),
            label: `${round.application.companyName}: ${round.roundName}`,
            applicationId: round.application.id,
          });
        }

        for (const rem of remsRes.data.data) {
          if (rem.reminderType === 'CUSTOM') {
            combined.push({
              id: `rem-${rem.id}`,
              type: 'reminder',
              dateKey: toDateKey(rem.scheduledAt),
              label: rem.title || `Reminder: ${rem.application?.companyName}`,
              applicationId: rem.applicationId,
            });
          }
        }

        setEvents(combined);
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to load calendar events.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadCalendarData();
  }, [addToast]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      cells.push({
        day,
        dateKey: toDateKey(dateObj),
        isToday: toDateKey(new Date()) === toDateKey(dateObj),
      });
    }
    return cells;
  }, [currentMonth]);

  const prevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Click any event to open its associated application
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Interview
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Deadline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Reminder
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[130px] text-center text-sm font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              {DAYS.map((d) => (
                <div key={d} className="py-2.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="min-h-[110px] bg-slate-50/50 dark:bg-slate-950/30" />;
                }
                const dayEvents = events.filter((e) => e.dateKey === cell.dateKey);
                return (
                  <div key={cell.dateKey} className="min-h-[110px] p-2">
                    <div className="mb-1 flex justify-end">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          cell.isToday
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          to={`/applications/${ev.applicationId}`}
                          className={`block truncate rounded border px-1.5 py-0.5 text-[11px] font-medium hover:opacity-80 ${
                            EVENT_COLORS[ev.type]
                          }`}
                          title={ev.label}
                        >
                          {ev.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
