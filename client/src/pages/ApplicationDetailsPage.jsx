import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Mail,
  Video,
  Bell,
} from 'lucide-react';
import api from '../services/api';
import {
  APPLICATION_STATUSES,
  INTERVIEW_STATUS_STYLES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  formatDate,
  formatDateTime,
} from '../utils/constants';
import { useToast } from '../context/ToastContext';
import ApplicationModal from '../components/ApplicationModal';
import InterviewModal from '../components/InterviewModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingApp, setSavingApp] = useState(false);
  const [deleteAppOpen, setDeleteAppOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState(false);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [savingInterview, setSavingInterview] = useState(false);
  const [deleteInterviewTarget, setDeleteInterviewTarget] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Application not found.', 'error');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      setApp((prev) => ({ ...prev, status: newStatus }));
      addToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleUpdateApp = async (payload) => {
    setSavingApp(true);
    try {
      const res = await api.patch(`/applications/${id}`, payload);
      setApp((prev) => ({ ...prev, ...res.data.data }));
      addToast('Application updated.', 'success');
      setEditModalOpen(false);
    } finally {
      setSavingApp(false);
    }
  };

  const handleDeleteApp = async () => {
    setDeletingApp(true);
    try {
      await api.delete(`/applications/${id}`);
      addToast('Application deleted.', 'info');
      navigate('/applications');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete application.', 'error');
    } finally {
      setDeletingApp(false);
    }
  };

  const handleSaveInterview = async (payload) => {
    setSavingInterview(true);
    try {
      if (editingInterview) {
        await api.patch(`/interviews/${editingInterview.id}`, payload);
        addToast('Interview round updated.', 'success');
      } else {
        await api.post(`/applications/${id}/interviews`, payload);
        addToast('Interview round added.', 'success');
      }
      setInterviewModalOpen(false);
      setEditingInterview(null);
      fetchDetails();
    } finally {
      setSavingInterview(false);
    }
  };

  const handleDeleteInterview = async () => {
    if (!deleteInterviewTarget) return;
    try {
      await api.delete(`/interviews/${deleteInterviewTarget.id}`);
      addToast('Interview round deleted.', 'info');
      setDeleteInterviewTarget(null);
      fetchDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete round.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-xl bg-white dark:bg-slate-900" />
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Back to applications"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {app.companyName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{app.jobTitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Application status"
            value={app.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold focus:outline-none ${
              STATUS_STYLES[app.status]
            }`}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => setDeleteAppOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Job Details &amp; Notes
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <span className="text-xs text-slate-400">Job Type</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{app.jobType}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Work Mode</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{app.workMode}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Priority</span>
                <p>
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                      PRIORITY_STYLES[app.priority]
                    }`}
                  >
                    {app.priority}
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-400">Location</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {app.location || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <DollarSign className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-400">Compensation</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {app.compensation || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-400">Deadline</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(app.deadline)}
                  </p>
                </div>
              </div>
            </div>

            {app.applicationUrl && (
              <div className="mt-4">
                <a
                  href={app.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
                >
                  View Job Posting <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {app.description && (
              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                  {app.description}
                </p>
              </div>
            )}

            {app.notes && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Personal Notes
                </h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                  {app.notes}
                </p>
              </div>
            )}
          </div>

          {/* Interview Rounds Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Interview Rounds ({app.interviews?.length || 0})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track every assessment, technical, and HR round
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingInterview(null);
                  setInterviewModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Round
              </button>
            </div>

            {!app.interviews || app.interviews.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                No interview rounds added yet. Click &ldquo;Add Round&rdquo; to schedule one.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {app.interviews.map((round) => (
                  <div
                    key={round.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {round.roundName}
                          </h3>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              INTERVIEW_STATUS_STYLES[round.status]
                            }`}
                          >
                            {round.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {round.interviewType} • {formatDateTime(round.scheduledAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingInterview(round);
                            setInterviewModalOpen(true);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          aria-label={`Edit ${round.roundName}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteInterviewTarget(round)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                          aria-label={`Delete ${round.roundName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                      {round.location && <span>Platform: {round.location}</span>}
                      {round.interviewerDetails && (
                        <span>Interviewer: {round.interviewerDetails}</span>
                      )}
                      {round.meetingLink && (
                        <a
                          href={round.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Meeting
                        </a>
                      )}
                    </div>

                    {round.preparationNotes && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300">Prep:</strong>{' '}
                        {round.preparationNotes}
                      </p>
                    )}
                    {round.feedback && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300">Feedback:</strong>{' '}
                        {round.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recruiter &amp; Metadata
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="h-4 w-4 text-slate-400" />
                <span>{app.recruiterName || 'No recruiter listed'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{app.recruiterEmail || 'No email listed'}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <p>Applied: {formatDate(app.applicationDate)}</p>
                <p className="mt-1">Created: {formatDate(app.createdAt)}</p>
                <p className="mt-1">Last Updated: {formatDate(app.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Reminders ({app.reminders?.length || 0})
              </h2>
              <Link
                to="/reminders"
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
              >
                <Bell className="h-3.5 w-3.5" /> Manage
              </Link>
            </div>
            {!app.reminders || app.reminders.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                No custom reminders for this application yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {app.reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800"
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-200">{rem.title}</p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      {formatDateTime(rem.scheduledAt)} • {rem.deliveryStatus}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplicationModal
        open={editModalOpen}
        initialData={app}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateApp}
        submitting={savingApp}
      />

      <InterviewModal
        open={interviewModalOpen}
        initialData={editingInterview}
        onClose={() => {
          setInterviewModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={handleSaveInterview}
        submitting={savingInterview}
      />

      <ConfirmDialog
        open={deleteAppOpen}
        title="Delete Application"
        message={`Are you sure you want to delete "${app.companyName} — ${app.jobTitle}"?`}
        loading={deletingApp}
        onConfirm={handleDeleteApp}
        onCancel={() => setDeleteAppOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleteInterviewTarget)}
        title="Delete Interview Round"
        message={`Delete "${deleteInterviewTarget?.roundName}"?`}
        onConfirm={handleDeleteInterview}
        onCancel={() => setDeleteInterviewTarget(null)}
      />
    </div>
  );
}
