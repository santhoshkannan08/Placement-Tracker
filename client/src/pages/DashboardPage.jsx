import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Activity,
  Video,
  Award,
  XCircle,
  TrendingUp,
  Clock,
  Plus,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { STATUS_CHART_COLORS, formatDateTime } from '../utils/constants';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ApplicationModal from '../components/ApplicationModal';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load dashboard stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateApp = async (payload) => {
    setSubmitting(true);
    try {
      await api.post('/applications', payload);
      addToast('Application added!', 'success');
      setModalOpen(false);
      fetchStats();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const summary = stats?.summary || {
    totalApplications: 0,
    activeApplications: 0,
    upcomingInterviews: 0,
    offersReceived: 0,
    rejectedApplications: 0,
    successRate: 0,
    pendingDeadlines: 0,
  };

  const kpis = [
    { label: 'Total Applications', value: summary.totalApplications, icon: Briefcase, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400' },
    { label: 'Active Applications', value: summary.activeApplications, icon: Activity, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' },
    { label: 'Upcoming Interviews', value: summary.upcomingInterviews, icon: Video, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400' },
    { label: 'Offers Received', value: summary.offersReceived, icon: Award, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400' },
    { label: 'Rejected', value: summary.rejectedApplications, icon: XCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400' },
    { label: 'Success Rate', value: `${summary.successRate}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400' },
    { label: 'Pending Deadlines', value: summary.pendingDeadlines, icon: Clock, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time overview of your placement pipeline and upcoming schedule
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Application
        </button>
      </div>

      {summary.totalApplications === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications tracked yet"
          description="Add your first job or internship application to unlock real-time analytics, Kanban tracking, and interview reminders."
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add First Application
            </button>
          }
        />
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {kpi.label}
                    </span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                    {kpi.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Donut Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Status Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of applications across pipeline stages
              </p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {stats.statusDistribution.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_CHART_COLORS[entry.name] || '#6366f1'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {stats.statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_CHART_COLORS[item.name] || '#6366f1' }}
                    />
                    <span>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Applications per Month
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly submission trend
              </p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyApplications}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Applications" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Funnel & Timeline Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Progress Funnel */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Application Progress Funnel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cumulative conversion from Applied to Offer Received
              </p>
              <div className="mt-5 space-y-4">
                {stats.funnel.map((step) => {
                  const maxCount = Math.max(stats.funnel[0]?.count || 1, 1);
                  const pct = Math.round((step.count / maxCount) * 100);
                  return (
                    <div key={step.stage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {step.stage}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {step.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Upcoming Interviews &amp; Deadlines
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Next scheduled events across your applications
                  </p>
                </div>
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Calendar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {stats.upcomingTimeline.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  No upcoming interviews or deadlines scheduled.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {stats.upcomingTimeline.map((item) => (
                    <Link
                      key={item.id}
                      to={`/applications/${item.applicationId}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            item.type === 'interview'
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {item.type === 'interview' ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <CalendarIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {formatDateTime(item.date)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateApp}
        submitting={submitting}
      />
    </div>
  );
}
