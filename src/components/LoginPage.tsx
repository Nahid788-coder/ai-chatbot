import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Screen = 'login' | 'register' | 'otp';

const LoginPage = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setScreen('otp'); // Show OTP screen
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'signup',
      });
      if (error) throw error;
      // Auto logged in after OTP verification
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP. Check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch {
      setError('Google login failed. Try again.');
    }
  };

  // OTP Verification Screen
  if (screen === 'otp') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>AI Chat</span>
          </div>

          <h2>Verify Your Email</h2>
          <p className="login-subtitle">
            We sent a 6-digit OTP to <strong>{email}</strong>. Check your inbox!
          </p>

          <form onSubmit={handleVerifyOtp} className="login-form">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="login-input otp-input"
              autoFocus
            />
            {error && <div className="login-error">⚠ {error}</div>}
            <button type="submit" className="login-submit-btn" disabled={loading || otp.length < 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>

          <p className="login-toggle">
            Wrong email?
            <button onClick={() => { setScreen('register'); setOtp(''); setError(''); }}>
              {' '}Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>AI Chat</span>
        </div>

        <h2>{screen === 'register' ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {screen === 'register' ? 'Sign up to save your chat history' : 'Login to access your conversations'}
        </p>

        {/* Google Login */}
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login-divider"><span>or</span></div>

        <form onSubmit={screen === 'register' ? handleRegister : handleLogin} className="login-form">
          {screen === 'register' && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="login-input"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="login-input"
          />
          {error && <div className="login-error">⚠ {error}</div>}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : screen === 'register' ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="login-toggle">
          {screen === 'register' ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setScreen(screen === 'register' ? 'login' : 'register'); setError(''); }}>
            {screen === 'register' ? ' Login' : ' Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
