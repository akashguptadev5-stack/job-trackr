import { supabase } from './supabase';
import type { Job, JobStatus } from '../types';

// ── Fetch all jobs for logged-in user ─────────────
export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('applied_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Job[];
}

// ── Create a new job ──────────────────────────────
export async function createJob(
  job: Omit<Job, 'id' | 'user_id' | 'applied_at' | 'updated_at'>
): Promise<Job> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...job, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Job;
}

// ── Update a job (status change, edit) ───────────
export async function updateJob(
  id: string,
  updates: Partial<Job>
): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Job;
}

// ── Delete a job ──────────────────────────────────
export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}