import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.scss';

export function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>J</div>
          <span className={styles.logoText}>JobTrackr AI</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account</p>

        <button className={styles.googleBtn} onClick={handleGoogle} type="button">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className={styles.divider}>
          <span />or<span />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className={styles.toggle}>
          No account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}