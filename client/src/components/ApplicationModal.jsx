import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  PRIORITIES,
  WORK_MODES,
  toDateInputValue,
} from '../utils/constants';

const initialForm = {
  companyName: '',
  jobTitle: '',
  jobType: 'Internship',
  workMode: 'On-site',
  location: '',
  compensation: '',
  applicationUrl: '',
  applicationDate: toDateInputValue(new Date()),
  deadline: '',
  status: 'Wishlist',
  priority: 'Medium',
  recruiterName: '',
  recruiterEmail: '',
  description: '',
  notes: '',
};

export default function ApplicationModal({ open, initialData, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (initialData) {
        setForm({
          companyName: initialData.companyName || '',
          jobTitle: initialData.jobTitle || '',
          jobType: initialData.jobType || 'Internship',
          workMode: initialData.workMode || 'On-site',
          location: initialData.location || '',
          compensation: initialData.compensation || '',
          applicationUrl: initialData.applicationUrl || '',
          applicationDate: toDateInputValue(initialData.applicationDate || new Date()),
          deadline: toDateInputValue(initialData.deadline),
          status: initialData.status || 'Wishlist',
          priority: initialData.priority || 'Medium',
          recruiterName: initialData.recruiterName || '',
          recruiterEmail: initialData.recruiterEmail || '',
          description: initialData.description || '',
          notes: initialData.notes || '',
        });
      } else {
        setForm({ ...initialForm, applicationDate: toDateInputValue(new Date()) });
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
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      setError('Company name and job title are required.');
      return;
    }
    try {
      await onSubmit({
        ...form,
        applicationDate: form.applicationDate || null,
        deadline: form.deadline || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save application.');
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
      aria-labelledby="app-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 id="app-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {initialData ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
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
              <label htmlFor="companyName" className={labelClass}>
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g., Stripe"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className={labelClass}>
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="e.g., Software Engineer Intern"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className={inputClass}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="jobType" className={labelClass}>
                Job Type
              </label>
              <select id="jobType" name="jobType" value={form.jobType} onChange={handleChange} className={inputClass}>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="workMode" className={labelClass}>
                Work Mode
              </label>
              <select id="workMode" name="workMode" value={form.workMode} onChange={handleChange} className={inputClass}>
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="priority" className={labelClass}>
                Priority
              </label>
              <select id="priority" name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="applicationDate" className={labelClass}>
                Application Date
              </label>
              <input
                id="applicationDate"
                type="date"
                name="applicationDate"
                value={form.applicationDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="deadline" className={labelClass}>
                Deadline (Optional)
              </label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className={labelClass}>
                Location
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Bengaluru, India"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="compensation" className={labelClass}>
                Expected Salary / Stipend
              </label>
              <input
                id="compensation"
                name="compensation"
                value={form.compensation}
                onChange={handleChange}
                placeholder="e.g., ₹60,000 / month"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="applicationUrl" className={labelClass}>
                Job URL
              </label>
              <input
                id="applicationUrl"
                type="url"
                name="applicationUrl"
                value={form.applicationUrl}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="recruiterName" className={labelClass}>
                Recruiter Name
              </label>
              <input
                id="recruiterName"
                name="recruiterName"
                value={form.recruiterName}
                onChange={handleChange}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="recruiterEmail" className={labelClass}>
                Recruiter Email
              </label>
              <input
                id="recruiterEmail"
                type="email"
                name="recruiterEmail"
                value={form.recruiterEmail}
                onChange={handleChange}
                placeholder="recruiter@company.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="Key responsibilities or tech stack..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>
              Personal Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="Preparation tips, referral info, follow-up reminders..."
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
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
