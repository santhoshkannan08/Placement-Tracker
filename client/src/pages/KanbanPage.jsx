import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Plus, Calendar, Clock, Video, Pencil, Trash2, GripVertical } from 'lucide-react';
import api from '../services/api';
import {
  APPLICATION_STATUSES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  formatDate,
} from '../utils/constants';
import { useToast } from '../context/ToastContext';
import ApplicationModal from '../components/ApplicationModal';
import ConfirmDialog from '../components/ConfirmDialog';

function KanbanCard({ app, onStatusChange, onEdit, onDelete, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { status: app.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const nextInterview = app.interviews?.find((i) => i.status === 'Upcoming');

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={`group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
        isDragging && !isOverlay ? 'opacity-40' : ''
      } ${isOverlay ? 'rotate-1 shadow-xl ring-2 ring-indigo-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={`/applications/${app.id}`}
            className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
          >
            {app.companyName}
          </Link>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{app.jobTitle}</p>
        </div>

        <button
          type="button"
          {...(isOverlay ? {} : listeners)}
          {...(isOverlay ? {} : attributes)}
          className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-800"
          aria-label={`Drag ${app.companyName}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
            PRIORITY_STYLES[app.priority] || PRIORITY_STYLES.Medium
          }`}
        >
          {app.priority}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {app.jobType}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>Applied {formatDate(app.applicationDate)}</span>
        </div>
        {app.deadline && (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Due {formatDate(app.deadline)}</span>
          </div>
        )}
        {nextInterview && (
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Video className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {nextInterview.roundName} ({formatDate(nextInterview.scheduledAt)})
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <select
          aria-label={`Change status for ${app.companyName}`}
          value={app.status}
          onChange={(e) => onStatusChange(app.id, e.target.value)}
          className="max-w-[130px] rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(app)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={`Edit ${app.companyName}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(app)}
            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
            aria-label={`Delete ${app.companyName}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ status, apps, onStatusChange, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] w-72 shrink-0 flex-col rounded-xl border p-3 transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50/40 dark:border-indigo-600 dark:bg-indigo-950/20'
          : 'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[status]
          }`}
        >
          {status}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        {apps.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {apps.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/80 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
            Drop applications here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load Kanban board.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (appId, newStatus) => {
    const target = applications.find((a) => a.id === appId);
    if (!target || target.status === newStatus) return;

    const previousApps = [...applications];
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      addToast(`Moved ${target.companyName} to ${newStatus}`, 'success');
    } catch (err) {
      // Revert on failure
      setApplications(previousApps);
      addToast(
        err.response?.data?.message || 'Failed to update status. Restored previous stage.',
        'error'
      );
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const newStatus = over.id;
    if (APPLICATION_STATUSES.includes(newStatus)) {
      handleStatusUpdate(active.id, newStatus);
    }
  };

  const handleSaveApp = async (payload) => {
    setSubmitting(true);
    try {
      if (editingApp) {
        const res = await api.patch(`/applications/${editingApp.id}`, payload);
        setApplications((prev) =>
          prev.map((a) => (a.id === editingApp.id ? res.data.data : a))
        );
        addToast('Application updated.', 'success');
      } else {
        const res = await api.post('/applications', payload);
        setApplications((prev) => [res.data.data, ...prev]);
        addToast('Application created.', 'success');
      }
      setModalOpen(false);
      setEditingApp(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/applications/${deleteTarget.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      addToast('Application deleted.', 'info');
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete application.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const activeApp = applications.find((a) => a.id === activeId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag cards between stages or use the status dropdown to update progress
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

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {APPLICATION_STATUSES.map((s) => (
            <div
              key={s}
              className="h-96 w-72 shrink-0 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setActiveId(e.active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {APPLICATION_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                apps={applications.filter((a) => a.status === status)}
                onStatusChange={handleStatusUpdate}
                onEdit={(app) => {
                  setEditingApp(app);
                  setModalOpen(true);
                }}
                onDelete={(app) => setDeleteTarget(app)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApp ? (
              <KanbanCard
                app={activeApp}
                onStatusChange={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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
        message={`Are you sure you want to delete "${deleteTarget?.companyName} — ${deleteTarget?.jobTitle}"? All associated interviews and reminders will also be removed.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
