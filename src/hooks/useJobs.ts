import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobs, createJob, updateJob, deleteJob } from '../lib/jobsService';
import type { Job, JobStatus } from '../types';

const JOBS_KEY = ['jobs']; // React Query cache key

export function useJobs() {
  const queryClient = useQueryClient();

  // ── READ: fetch all jobs ───────────────────────
  // React Query handles: loading, error, caching, background refetch
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: JOBS_KEY,
    queryFn: fetchJobs,
  });

  // ── CREATE: add a new job ──────────────────────
  const createMutation = useMutation({
    mutationFn: createJob,
    // Optimistic update — add job to UI instantly before server responds
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: JOBS_KEY });
      const previous = queryClient.getQueryData<Job[]>(JOBS_KEY);

      // Immediately add a temporary job to the cache
      queryClient.setQueryData<Job[]>(JOBS_KEY, old => [
        {
          ...newJob,
          id: `temp-${Date.now()}`,
          user_id: '',
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Job,
        ...(old ?? []),
      ]);

      return { previous }; // save snapshot for rollback
    },
    onError: (_err, _vars, context) => {
      // If server fails — roll back to previous state
      if (context?.previous) {
        queryClient.setQueryData(JOBS_KEY, context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after mutation to sync with server
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });

  // ── UPDATE STATUS: drag and drop ───────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      updateJob(id, { status }),
    // Optimistic update — move card immediately in UI
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: JOBS_KEY });
      const previous = queryClient.getQueryData<Job[]>(JOBS_KEY);

      queryClient.setQueryData<Job[]>(JOBS_KEY, old =>
        old?.map(j => j.id === id ? { ...j, status } : j) ?? []
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(JOBS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  });

  // ── UPDATE: edit job details ───────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Job> }) =>
      updateJob(id, updates),
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  });

  // ── DELETE ─────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: JOBS_KEY });
      const previous = queryClient.getQueryData<Job[]>(JOBS_KEY);
      queryClient.setQueryData<Job[]>(JOBS_KEY, old =>
        old?.filter(j => j.id !== id) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(JOBS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  });

  // Group jobs by status for the Kanban columns
  const jobsByStatus = {
    applied:   jobs.filter(j => j.status === 'applied'),
    interview: jobs.filter(j => j.status === 'interview'),
    offer:     jobs.filter(j => j.status === 'offer'),
    rejected:  jobs.filter(j => j.status === 'rejected'),
  };

  return {
    jobs,
    jobsByStatus,
    isLoading,
    error,
    createJob:    createMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    updateJob:    updateMutation.mutate,
    deleteJob:    deleteMutation.mutate,
    isCreating:   createMutation.isPending,
  };
}