import { useReducer } from 'react';
import type { Job, JobStatus } from '../../types';
import styles from './AddJobModal.module.scss';

interface FormState {
  company: string;
  role: string;
  location: string;
  job_url: string;
  status: JobStatus;
  salary_min: string;
  salary_max: string;
  notes: string;
}

// useReducer — better than useState for multi-field forms
type Action = { field: keyof FormState; value: string };

const initialState: FormState = {
  company: '', role: '', location: '', job_url: '',
  status: 'applied', salary_min: '', salary_max: '', notes: '',
};

function formReducer(state: FormState, action: Action): FormState {
  return { ...state, [action.field]: action.value };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Omit<Job, 'id' | 'user_id' | 'applied_at' | 'updated_at'>) => void;
  isLoading: boolean;
  editJob?: Job | null;
}

export function AddJobModal({ isOpen, onClose, onSubmit, isLoading, editJob }: Props) {
  const [form, dispatch] = useReducer(formReducer, editJob ? {
    company: editJob.company,
    role: editJob.role,
    location: editJob.location,
    job_url: editJob.job_url ?? '',
    status: editJob.status,
    salary_min: editJob.salary_min?.toString() ?? '',
    salary_max: editJob.salary_max?.toString() ?? '',
    notes: editJob.notes ?? '',
  } : initialState);

  if (!isOpen) return null;

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      dispatch({ field, value: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      company: form.company,
      role: form.role,
      location: form.location,
      job_url: form.job_url || undefined,
      status: form.status,
      salary_min: form.salary_min ? Number(form.salary_min) : undefined,
      salary_max: form.salary_max ? Number(form.salary_max) : undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{editJob ? 'Edit job' : 'Add new job'}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Company *</label>
              <input value={form.company} onChange={set('company')} placeholder="Google" required />
            </div>
            <div className={styles.field}>
              <label>Role *</label>
              <input value={form.role} onChange={set('role')} placeholder="Frontend Engineer" required />
            </div>
          </div>

          <div className={styles.field}>
            <label>Job URL</label>
            <input value={form.job_url} onChange={set('job_url')} placeholder="https://careers.google.com/..." type="url" />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Remote / Bengaluru" />
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Min salary (₹L)</label>
              <input value={form.salary_min} onChange={set('salary_min')} type="number" placeholder="20" />
            </div>
            <div className={styles.field}>
              <label>Max salary (₹L)</label>
              <input value={form.salary_max} onChange={set('salary_max')} type="number" placeholder="35" />
            </div>
          </div>

          <div className={styles.field}>
            <label>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Referral, deadline, interview rounds..." rows={2} />
          </div>

          <button className={styles.submit} type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : editJob ? 'Save changes' : 'Add job'}
          </button>
        </form>
      </div>
    </div>
  );
}