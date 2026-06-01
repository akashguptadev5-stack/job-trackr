import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../types';
import styles from './JobCard.module.scss';

interface Props {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: Props) {
  // useSortable gives us drag handles and transform values from dnd-kit
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.applied_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.top}>
        <div>
          <div className={styles.company}>{job.company}</div>
          <div className={styles.role}>{job.role}</div>
        </div>
      </div>

      {job.location && (
        <div className={styles.tags}>
          <span className={styles.tag}>{job.location}</span>
        </div>
      )}

      {job.ai_match_score !== undefined && job.ai_match_score !== null && (
        <div className={styles.matchBar}>
          <div className={styles.matchRow}>
            <span className={styles.matchLabel}>AI match</span>
            <span className={styles.matchPct}>{job.ai_match_score}%</span>
          </div>
          <div className={styles.barBg}>
            <div className={styles.barFill} style={{ width: `${job.ai_match_score}%` }} />
          </div>
        </div>
      )}

      {job.salary_min && (
        <div className={styles.salary}>
          ₹{job.salary_min}L – ₹{job.salary_max}L
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.date}>
          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
        </span>
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={e => { e.stopPropagation(); onEdit(job); }}
            aria-label="Edit job"
          >
            <i className="ti ti-edit" aria-hidden="true" />
          </button>
          <button
            className={styles.iconBtn}
            onClick={e => { e.stopPropagation(); onDelete(job.id); }}
            aria-label="Delete job"
          >
            <i className="ti ti-trash" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}