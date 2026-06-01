import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside AuthProvider', () => {
    // Suppress console.error for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used inside <AuthProvider>'
    );
  });

  it('starts with loading true then resolves', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Initially loading
    expect(result.current.loading).toBe(true);
  });

  it('calls signOut on supabase', async () => {
    const mockSignOut = vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('calls signInWithPassword with correct args', async () => {
    const mockSignIn = vi.spyOn(supabase.auth, 'signInWithPassword')
      .mockResolvedValue({ data: { user: null, session: null }, error: null } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signInWithEmail('test@test.com', 'password123');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});