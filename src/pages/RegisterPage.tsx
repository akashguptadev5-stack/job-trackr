import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.scss';

export function RegisterPage() {
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>J</div>
          <span className={styles.logoText}>JobTrackr AI</span>
        </div>

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Start tracking smarter with AI</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full name</label>
            <input
              type="text"
              placeholder="Akash Gupta"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.toggle}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}   