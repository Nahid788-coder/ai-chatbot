import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/auth';
import { Logo } from './Logo';
import { IconGithub } from './Icons';
import type { Theme } from '../hooks/useTheme';
import { IconMoon, IconSun } from './Icons';

type Screen = 'login' | 'register' | 'otp';

const errMsg = (e: unknown, fallback: string) => (e instanceof Error && e.message) || fallback;

const FEATURES = [
  'Chat with Llama, GPT-OSS, Gemini and more in one place',
  'Replies stream in live, with Markdown and code blocks',
  'Your conversations are saved and searchable',
];

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
}

const LoginPage = ({ theme, onToggleTheme }: Props) => {
  const { login, register, verifyOtp, loginWithGoogle } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCountdown = () => {
    if (timer.current) clearInterval(timer.current);
    setCountdown(30);
    timer.current = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1 && timer.current) clearInterval(timer.current);
        return Math.max(0, s - 1);
      });
    }, 1000);
  };

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      setError(errMsg(e, fallback));
    } finally {
      setLoading(false);
    }
  };

  const onRegister = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await register(name, phone, email, password);
      setScreen('otp');
      startCountdown();
    }, 'Could not create the account');
  };

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    run(() => login(email, password), 'Invalid email or password');
  };

  const onVerify = (e: FormEvent) => {
    e.preventDefault();
    run(() => verifyOtp(email, otp), 'Invalid code. Check your email.');
  };

  const onResend = () =>
    run(async () => {
      await register(name, phone, email, password);
      setOtp('');
      startCountdown();
    }, 'Could not resend the code');

  const switchTo = (s: Screen) => {
    setScreen(s);
    setError('');
    setPassword('');
    setOtp('');
  };

  return (
    <div className="auth">
      <section className="auth-brand">
        <div className="aurora-bg" aria-hidden />
        <Logo size={36} />
        <div className="auth-pitch">
          <h1>
            One place to chat with <span className="grad-text">many AI models</span>.
          </h1>
          <p>
            Aurora Chat is an open-source portfolio project. Pick a model, ask anything, and keep every
            conversation.
          </p>
          <ul>
            {FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="auth-credit">
          <span>
            Built by{' '}
            <a href="https://portfolio-coral-nu-78.vercel.app" target="_blank" rel="noreferrer">
              Nahid Husain Doi
            </a>
          </span>
          <a href="https://github.com/Nahid788-coder/ai-chatbot" target="_blank" rel="noreferrer" className="gh-link">
            <IconGithub size={16} /> Source on GitHub
          </a>
        </div>
      </section>

      <section className="auth-panel">
        <button className="icon-btn auth-theme" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        <div className="auth-card">
          <div className="only-mobile auth-mobile-logo">
            <Logo size={30} />
          </div>

          {screen === 'otp' ? (
            <>
              <h2>Check your email</h2>
              <p className="auth-sub">
                We sent a 6-digit code to <strong>{email}</strong>.
              </p>
              <form onSubmit={onVerify} className="auth-form">
                <input
                  className="field otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                  aria-label="Verification code"
                />
                {error && <div className="auth-error">{error}</div>}
                <button className="btn-primary" disabled={loading || otp.length < 6}>
                  {loading ? 'Verifying…' : 'Verify and continue'}
                </button>
              </form>
              <p className="auth-foot">
                {countdown > 0 ? (
                  <>Resend code in {countdown}s</>
                ) : (
                  <button className="link" onClick={onResend} disabled={loading}>
                    Resend code
                  </button>
                )}
                {' · '}
                <button className="link" onClick={() => switchTo('register')}>
                  Change email
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>{screen === 'register' ? 'Create your account' : 'Welcome back'}</h2>
              <p className="auth-sub">
                {screen === 'register' ? 'Sign up to save your chat history.' : 'Log in to continue your conversations.'}
              </p>

              <button className="btn-google" onClick={() => run(loginWithGoogle, 'Google sign-in failed')} disabled={loading}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="divider"><span>or</span></div>

              <form onSubmit={screen === 'register' ? onRegister : onLogin} className="auth-form">
                {screen === 'register' && (
                  <>
                    <input className="field" placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input className="field" type="tel" placeholder="Phone number" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </>
                )}
                <input
                  className="field"
                  placeholder={screen === 'register' ? 'Email address' : 'Email or phone number'}
                  type={screen === 'register' ? 'email' : 'text'}
                  autoComplete={screen === 'register' ? 'email' : 'username'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="field"
                  type="password"
                  placeholder="Password (min 6 characters)"
                  autoComplete={screen === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                {error && <div className="auth-error">{error}</div>}
                <button className="btn-primary" disabled={loading}>
                  {loading ? 'Please wait…' : screen === 'register' ? 'Create account' : 'Log in'}
                </button>
              </form>

              <p className="auth-foot">
                {screen === 'register' ? 'Already have an account? ' : "Don't have an account? "}
                <button className="link" onClick={() => switchTo(screen === 'register' ? 'login' : 'register')}>
                  {screen === 'register' ? 'Log in' : 'Sign up'}
                </button>
              </p>
            </>
          )}
        </div>
        <p className="auth-legal">
          A personal portfolio project. Not affiliated with Google, Meta, OpenAI or any model provider.
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
