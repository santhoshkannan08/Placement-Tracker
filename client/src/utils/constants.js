export const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Assessment',
  'Interview',
  'Offer Received',
  'Rejected',
];

export const JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];
export const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

export const INTERVIEW_TYPES = [
  'Online assessment',
  'Aptitude test',
  'Technical interview',
  'Coding round',
  'HR interview',
  'Final interview',
];

export const INTERVIEW_STATUSES = ['Upcoming', 'Completed', 'Passed', 'Failed', 'Cancelled'];

export const STATUS_STYLES = {
  Wishlist: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Assessment: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Interview: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'Offer Received': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

export const STATUS_CHART_COLORS = {
  Wishlist: '#64748b',
  Applied: '#3b82f6',
  Assessment: '#f59e0b',
  Interview: '#6366f1',
  'Offer Received': '#10b981',
  Rejected: '#f43f5e',
};

export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  High: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
};

export const INTERVIEW_STATUS_STYLES = {
  Upcoming: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  Completed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Passed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  Cancelled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export function formatDate(dateVal) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateVal) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toDateInputValue(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function toDateTimeLocalValue(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
