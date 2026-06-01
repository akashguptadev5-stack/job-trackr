import { createContext, useContext, useEffect, useState } from 'react';
import type {ReactNode} from 'react';
import { supabase } from '../lib/supabase';
import type { AuthContextType, User } from '../types';

// 1. Create the context with a default of null
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Provider wraps the entire app — any child can read auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true while Supabase checks session

  useEffect(() => {
    // On mount: check if a session already exists (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as User ?? null);
      setLoading(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user as User ?? null);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: import.meta.env.VITE_SITE_URL || 'http://localhost:5173/dashboard' },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error; // let the form handle the error message
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook — always use this, never useContext(AuthContext) directly
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}