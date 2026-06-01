import { supabase } from './supabase';

// Wraps fetch with Supabase JWT token automatically
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}