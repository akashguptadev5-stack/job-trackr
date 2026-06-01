import { useState, useMemo } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type {
  DragEndEvent
} from '@dnd-kit/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { KanbanColumn } from '../components/ui/KanbanColumn';
import { AddJobModal } from '../components/ui/AddJobModal';
import type { Job, JobStatus } from '../types';
import styles from './DashboardPage.module.scss';

const STATUSES: JobStatus[] = ['applied', 'interview', 'offer', 'rejected'];

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { jobs, jobsByStatus, isLoading, createJob, updateStatus, deleteJob, isCreating } = useJobs();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [search, setSearch] = useState('');

  // useMemo — only recompute when jobs or search changes, not every render
  const filteredByStatus = useMemo(() => {
    if (!search.trim()) return jobsByStatus;
    const q = search.toLowerCase();
    const filtered = jobs.filter(j =>
      j.company.toLowerCase().includes(q) ||
      j.role.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
    return {
      applied: filtered.filter(j => j.status === 'applied'),
      interview: filtered.filter(j => j.status === 'interview'),
      offer: filtered.filter(j => j.status === 'offer'),
      rejected: filtered.filter(j => j.status === 'rejected'),
    };
  }, [jobs, jobsByStatus, search]);

  // dnd-kit sensors — how drag is initiated (pointer = mouse + touch)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // When drag ends — update status if dropped in a different column
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;

    const job = jobs.find(j => j.id === jobId);
    if (job && job.status !== newStatus && STATUSES.includes(newStatus)) {
      // Optimistic update fires immediately, server syncs in background
      updateStatus({ id: jobId, status: newStatus });
    }
  };

  const handleEdit = (job: Job) => {
    setEditJob(job);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this job?')) deleteJob(id);
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className={styles.wrap}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>J</div>
          <span className={styles.logoText}>JobTrackr AI</span>
        </div>
        <nav className={styles.nav}>
          <span className={styles.navItem}>Dashboard</span>
        </nav>
        <div className={styles.right}>
          <button className={styles.addBtn} onClick={() => { setEditJob(null); setModalOpen(true); }}>
            <i className="ti ti-plus" aria-hidden="true" /> Add job
          </button>
          <div className={styles.avatar} title={user?.email}>{initials}</div>
          <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className={styles.body}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div
            className={`${styles.sideItem} ${location.pathname === '/dashboard' ? styles.active : ''}`}
            title="Dashboard"
            onClick={() => navigate('/dashboard')}
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true" />
          </div>
          <div
            className={`${styles.sideItem} ${location.pathname === '/analyse' ? styles.active : ''}`}
            title="AI Resume Analyser"
            onClick={() => navigate('/analyse')}
          >
            <i className="ti ti-sparkles" aria-hidden="true" />
          </div>
          <div
            className={`${styles.sideItem} ${location.pathname === '/interview' ? styles.active : ''}`}
            title="AI Interview (Phase 4)"
            onClick={() => navigate('/interview')}
          >
            <i className="ti ti-microphone" aria-hidden="true" />
          </div>
          <div
            className={`${styles.sideItem} ${location.pathname === '/analytics' ? styles.active : ''}`}
            title="Analytics"
            onClick={() => navigate('/analytics')}
          >
            <i className="ti ti-chart-bar" aria-hidden="true" />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>
          {/* Stats row */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statVal}>{jobs.length}</div>
              <div className={styles.statLabel}>Total applied</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{jobsByStatus.interview.length}</div>
              <div className={styles.statLabel}>Interviews</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>
                {jobs.filter(j => j.ai_match_score).length > 0
                  ? Math.round(jobs.reduce((s, j) => s + (j.ai_match_score ?? 0), 0) / jobs.filter(j => j.ai_match_score).length)
                  : '—'}%
              </div>
              <div className={styles.statLabel}>Avg AI match</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statVal}>{jobsByStatus.offer.length}</div>
              <div className={styles.statLabel}>Offers</div>
            </div>
          </div>

          {/* Search */}
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <i className="ti ti-search" aria-hidden="true" />
              <input
                className={styles.search}
                placeholder="Search by company, role, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Kanban board with drag and drop */}
          {isLoading ? (
            <div className={styles.loading}>Loading your jobs...</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className={styles.kanban}>
                {STATUSES.map(status => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    jobs={filteredByStatus[status]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </DndContext>
          )}
        </main>
      </div>

      {/* ── Add / Edit Modal ── */}
      <AddJobModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditJob(null); }}
        onSubmit={data => editJob
          ? updateStatus({ id: editJob.id, status: data.status })
          : createJob(data)
        }
        isLoading={isCreating}
        editJob={editJob}
      />
    </div>
  );
}