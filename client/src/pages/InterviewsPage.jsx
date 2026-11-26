import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { INTERVIEW_STATUSES, INTERVIEW_STATUS_STYLES, formatDateTime } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import InterviewModal from '../components/InterviewModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function InterviewsPage() {
  const { addToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews');
      setInterviews(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load interviews.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/interviews/${id}`, { status });
      setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      addToast(`Interview marked as ${status}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleSave = async (payload) => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/interviews/${editing.id}`, payload);
      addToast('Interview updated.', 'success');
      setEditing(null);
      fetchInterviews();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/interviews/${deleteTarget.id}`);
      addToast('Interview deleted.', 'info');
      setDeleteTarget(null);
      fetchInterviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete interview.', 'error');
    }
  };

  const filtered =
    statusFilter === 'All' ? interviews : interviews.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Interview Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All upcoming and completed interview rounds across your applications
          </p>
        </div>

        <select
          aria-label="Filter interviews by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="All">All Statuses</option>
          {INTERVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No interview rounds found"
          description="Open any application to add an interview round and track your preparation and feedback."
          action={
            <Link
              to="/applications"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Browse Applications
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/applications/${item.application.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {item.application.companyName} — {item.roundName}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.application.jobTitle} • {item.interviewType}
                  </p>
                </div>

                <select
                  aria-label={`Update status for ${item.roundName}`}
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className={`rounded-md px-2 py-1 text-xs font-semibold focus:outline-none ${
                    INTERVIEW_STATUS_STYLES[item.status]
                  }`}
                >
                  {INTERVIEW_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDateTime(item.scheduledAt)}</span>
                </div>
                {item.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                {item.meetingLink ? (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Meeting
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">No meeting link</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    aria-label={`Edit ${item.roundName}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                    aria-label={`Delete ${item.roundName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <InterviewModal
        open={Boolean(editing)}
        initialData={editing}
        onClose={() => setEditing(null)}
        onSubmit={handleSave}
        submitting={saving}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Interview Round"
        message={`Delete "${deleteTarget?.roundName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
