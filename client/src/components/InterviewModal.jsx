import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { INTERVIEW_STATUSES, INTERVIEW_TYPES, toDateTimeLocalValue } from '../utils/constants';

const initialForm = {
  roundName: '',
  interviewType: 'Technical interview',
  scheduledAt: '',
  location: '',
  meetingLink: '',
  interviewerDetails: '',
  status: 'Upcoming',
  preparationNotes: '',
  feedback: '',
};

export default function InterviewModal({ open, initialData, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (initialData) {
        setForm({
          roundName: initialData.roundName || '',
          interviewType: initialData.interviewType || 'Technical interview',
          scheduledAt: toDateTimeLocalValue(initialData.scheduledAt),
          location: initialData.location || '',
          meetingLink: initialData.meetingLink || '',
          interviewerDetails: initialData.interviewerDetails || '',
          status: initialData.status || 'Upcoming',
          preparationNotes: initialData.preparationNotes || '',
          feedback: initialData.feedback || '',
        });
      } else {
        setForm({
          ...initialForm,
          scheduledAt: toDateTimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        });
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.roundName.trim() || !form.scheduledAt) {
      setError('Round name and scheduled date/time are required.');
      return;
    }
    try {
      await onSubmit({
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save interview round.');
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
  const labelClass = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 id="interview-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {initialData ? 'Edit Interview Round' : 'Add Interview Round'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="roundName" className={labelClass}>
                Round Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="roundName"
                name="roundName"
                value={form.roundName}
                onChange={handleChange}
                placeholder="e.g., Technical Round 1"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="interviewType" className={labelClass}>
                Interview Type
              </label>
              <select
                id="interviewType"
                name="interviewType"
                value={form.interviewType}
                onChange={handleChange}
                className={inputClass}
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="scheduledAt" className={labelClass}>
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="interviewStatus" className={labelClass}>
                Status
              </label>
              <select
                id="interviewStatus"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                {INTERVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="intLocation" className={labelClass}>
                Platform / Location
              </label>
              <input
                id="intLocation"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Google Meet or Office"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="meetingLink" className={labelClass}>
                Meeting Link
              </label>
              <input
                id="meetingLink"
                type="url"
                name="meetingLink"
                value={form.meetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="interviewerDetails" className={labelClass}>
              Interviewer Details
            </label>
            <input
              id="interviewerDetails"
              name="interviewerDetails"
              value={form.interviewerDetails}
              onChange={handleChange}
              placeholder="e.g., Jane Doe, Senior Engineer"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="preparationNotes" className={labelClass}>
              Preparation Notes
            </label>
            <textarea
              id="preparationNotes"
              name="preparationNotes"
              rows={2}
              value={form.preparationNotes}
              onChange={handleChange}
              placeholder="Topics to revise, questions to ask..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="feedback" className={labelClass}>
              Feedback / Outcome Notes
            </label>
            <textarea
              id="feedback"
              name="feedback"
              rows={2}
              value={form.feedback}
              onChange={handleChange}
              placeholder="How the round went..."
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Save Round' : 'Add Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
