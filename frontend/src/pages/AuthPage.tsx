import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onAuthSuccess: (user: { id: string; email: string }) => void;
}

const DEV_MODE = import.meta.env.MODE === 'development';
const DEV_USER_ID = '5b4b4ba2-ad71-44c8-8e6a-fee9313eee5c';
const DEV_USER_EMAIL = 'dev@example.com';

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In dev mode, we skip Supabase and use a test user
      // Store a fake session with a test token
      const testToken = 'dev-test-token-' + DEV_USER_ID;
      localStorage.setItem('sb-dev-token', testToken);
      
      onAuthSuccess({
        id: DEV_USER_ID,
        email: DEV_USER_EMAIL,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dev login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else if (result.data.user) {
        // For signup without email confirmation, session is included
        // For signup with email confirmation required, session will be null
        if (isSignUp && !result.data.session) {
          setError('Email verification required. Please check your email inbox to confirm your account.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        } else {
          // Either sign-in or sign-up with immediate session
          onAuthSuccess({
            id: result.data.user.id,
            email: result.data.user.email || '',
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>

      {DEV_MODE && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '10px', 
          marginBottom: '15px',
          borderRadius: '4px',
          border: '1px solid #ffc107',
          fontSize: '14px'
        }}>
          <strong>🚀 Development Mode:</strong> Use the button below to test without Supabase auth
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!DEV_MODE}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!DEV_MODE}
            disabled={loading}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {DEV_MODE && (
        <button 
          type="button"
          onClick={handleDevLogin}
          disabled={loading}
          style={{
            marginTop: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Loading...' : '🚀 Dev Login (Skip Auth)'}
        </button>
      )}

      <p>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          disabled={loading}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}
