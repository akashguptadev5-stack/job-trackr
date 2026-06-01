import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { JobCard } from './JobCard';
import type { Job, JobStatus } from '../../types';
import styles from './KanbanColumn.module.scss';

const COLUMN_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  applied:   { label: 'Applied',   color: '#60a5fa' },
  interview: { label: 'Interview', color: '#a78bfa' },
  offer:     { label: 'Offer',     color: '#34d399' },
  rejected:  { label: 'Rejected',  color: '#f87171' },
};

interface Props {
  status: JobStatus;
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ status, jobs, onEdit, onDelete }: Props) {
  const config = COLUMN_CONFIG[status];

  // useDroppable makes this column a drop target for dnd-kit
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`${styles.col} ${isOver ? styles.over : ''}`}>
      <div className={styles.header}>
        <span className={styles.title} style={{ color: config.color }}>
          {config.label}
        </span>
        <span className={styles.count}>{jobs.length}</span>
      </div>

      {/* SortableContext enables drag sorting within the column */}
      <SortableContext
        id={status}
        items={jobs.map(j => j.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className={styles.cards}>
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {jobs.length === 0 && (
            <div className={styles.empty}>Drop jobs here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}