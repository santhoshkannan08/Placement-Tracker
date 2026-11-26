import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
  Briefcase,
} from 'lucide-react';
import api from '../services/api';
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  PRIORITIES,
  WORK_MODES,
  STATUS_STYLES,
  PRIORITY_STYLES,
  formatDate,
} from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ApplicationModal from '../components/ApplicationModal';
import ConfirmDialog from '../components/ConfirmDialog';

const initialFilters = {
  search: '',
  status: 'All',
  jobType: 'All',
  priority: 'All',
  workMode: 'All',
  startDate: '',
  endDate: '',
  sort: 'newest',
};

export default function ApplicationsPage() {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'All') params[k] = v;
      });
      const res = await api.get('/applications', { params });
      setApplications(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(initialFilters);

  const handleSaveApp = async (payload) => {
    setSubmitting(true);
    try {
      if (editingApp) {
        await api.patch(`/applications/${editingApp.id}`, payload);
        addToast('Application updated.', 'success');
      } else {
        await api.post('/applications', payload);
        addToast('Application created.', 'success');
      }
      setModalOpen(false);
      setEditingApp(null);
      fetchApplications();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/applications/${deleteTarget.id}`);
      addToast('Application deleted.', 'info');
      setDeleteTarget(null);
      fetchApplications();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete application.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const selectClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            All Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, sort, and manage every job and internship application
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingApp(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Application
        </button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by company or job title..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={selectClass}
          >
            <option value="All">All Statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort applications"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className={selectClass}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="deadline">Sort: Upcoming Deadline</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by job type"
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className={selectClass}
          >
            <option value="All">All Job Types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className={selectClass}
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by work mode"
            value={filters.workMode}
            onChange={(e) => handleFilterChange('workMode', e.target.value)}
            className={selectClass}
          >
            <option value="All">All Work Modes</option>
            {WORK_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="date"
              aria-label="Start date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={selectClass}
            />
            <span>to</span>
            <input
              type="date"
              aria-label="End date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={selectClass}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No matching applications"
          description="Try adjusting your search or filter criteria, or add a new application."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Company &amp; Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type &amp; Mode</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/applications/${app.id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                      >
                        {app.companyName}
                      </Link>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {app.jobTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[app.status]
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      <div>{app.jobType}</div>
                      <div className="text-slate-400">{app.workMode}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          PRIORITY_STYLES[app.priority]
                        }`}
                      >
                        {app.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(app.applicationDate)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(app.deadline)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {app.applicationUrl && (
                          <a
                            href={app.applicationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            aria-label="Open job posting"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApp(app);
                            setModalOpen(true);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          aria-label={`Edit ${app.companyName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(app)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                          aria-label={`Delete ${app.companyName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ApplicationModal
        open={modalOpen}
        initialData={editingApp}
        onClose={() => {
          setModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleSaveApp}
        submitting={submitting}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Application"
        message={`Are you sure you want to delete "${deleteTarget?.companyName} — ${deleteTarget?.jobTitle}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
