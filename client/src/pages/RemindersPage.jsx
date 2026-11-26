import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MailCheck, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { formatDateTime, toDateTimeLocalValue } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const DELIVERY_BADGE = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  SENT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  PREVIEWED: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  FAILED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  SKIPPED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function RemindersPage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [reminders, setReminders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [applicationId, setApplicationId] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() =>
    toDateTimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
  );
  const [submitting, setSubmitting] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [remRes, appRes] = await Promise.all([api.get('/reminders'), api.get('/applications')]);
      setReminders(remRes.data.data);
      setApplications(appRes.data.data);
      if (appRes.data.data.length > 0 && !applicationId) {
        setApplicationId(appRes.data.data[0].id);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load reminders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, applicationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!applicationId || !scheduledAt) return;
    setSubmitting(true);
    try {
      await api.post('/reminders', {
        applicationId,
        reminderType: 'CUSTOM',
        title: title.trim() || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      addToast('Custom reminder scheduled!', 'success');
      setTitle('');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to schedule reminder.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      addToast('Reminder deleted.', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete reminder.', 'error');
    }
  };

  const handleToggleEmails = async () => {
    try {
      const next = !user.emailRemindersEnabled;
      await updateProfile({ emailRemindersEnabled: next });
      addToast(
        next ? 'Email reminders enabled.' : 'Email reminders paused.',
        'success'
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update preference.', 'error');
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await api.post('/reminders/test-email');
      addToast(res.data.message, 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send test email.', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications &amp; Reminders
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Automated 24-hour deadline &amp; interview alerts plus custom reminders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleEmails}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold ${
              user?.emailRemindersEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Email Alerts: {user?.emailRemindersEnabled ? 'Enabled' : 'Paused'}
          </button>

          <button
            type="button"
            onClick={handleTestEmail}
            disabled={testingEmail}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <MailCheck className="h-4 w-4" />
            {testingEmail ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {/* Create Custom Reminder */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Schedule Custom Reminder
        </h2>
        <form onSubmit={handleCreateReminder} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select
            aria-label="Select application"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            required
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {applications.length === 0 ? (
              <option value="">No applications available</option>
            ) : (
              applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.companyName} — {a.jobTitle}
                </option>
              ))
            )}
          </select>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder note (e.g., Follow up with recruiter)"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <input
            type="datetime-local"
            aria-label="Reminder date and time"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={submitting || applications.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {submitting ? 'Scheduling...' : 'Add Reminder'}
          </button>
        </form>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders scheduled"
          description="Automatic reminders are created 24 hours before deadlines and interviews, or you can add a custom reminder above."
        />
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {rem.title}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      DELIVERY_BADGE[rem.deliveryStatus] || DELIVERY_BADGE.PENDING
                    }`}
                  >
                    {rem.deliveryStatus}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <Link
                    to={`/applications/${rem.applicationId}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {rem.application?.companyName} — {rem.application?.jobTitle}
                  </Link>
                  <span>• Scheduled: {formatDateTime(rem.scheduledAt)}</span>
                  <span>• Type: {rem.reminderType}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(rem.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                aria-label="Delete reminder"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
