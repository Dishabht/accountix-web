import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Eye, EyeOff, Loader2, Lock, Mail, PlayCircle } from 'lucide-react';

const isDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true';
const DEMO_EMAIL = 'admin@portal.com';
const DEMO_PASSWORD = 'admin123';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [flashVisible, setFlashVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stateMessage = (location.state as { message?: string } | null)?.message;
    const storedMessage = sessionStorage.getItem('auth:flash');
    const message = stateMessage || storedMessage;
    let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let clearTimeoutId: ReturnType<typeof setTimeout> | undefined;

    if (message) {
      setFlashMessage(message);
      setFlashVisible(true);
      hideTimeoutId = setTimeout(() => {
        setFlashVisible(false);
        clearTimeoutId = setTimeout(() => setFlashMessage(''), 240);
        sessionStorage.removeItem('auth:flash');
      }, 2800);
    }

    return () => {
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId);
      }

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId);
      }
    };
  }, [location.state]);

  const signIn = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);

    try {
      // Call centralized API service instead of direct fetch
      const data = await api.post('/auth/login', null, { email: loginEmail, password: loginPassword });

      if (!data || data.error) {
        throw new Error(data?.error || 'Login failed');
      }

      login(data.token, data.user, rememberMe);
      sessionStorage.removeItem('auth:flash');
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  const handleDemoAccess = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    signIn(DEMO_EMAIL, DEMO_PASSWORD);
  };

  return (
    <section className="min-h-screen bg-white lg:flex">
      <div className="hidden lg:w-1/2 lg:flex bg-white" />

      <div className="lg:w-1/2 py-8 px-6 flex flex-col justify-center relative">
        <div className="pointer-events-none absolute left-6 right-6 top-6 z-20 sm:left-auto sm:right-6 sm:w-[min(100%-3rem,28rem)] lg:right-8">
          {flashMessage && (
            <div
              data-testid="auth-flash-message"
              className={`rounded-xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.35)] backdrop-blur-md transition-all duration-300 ease-out ${flashVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                <p className="leading-5 text-emerald-900">{flashMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:max-w-[464px] mx-auto w-full">
          <div>
            <Link to="/login" className="mb-3 inline-flex items-center gap-3">
              <span data-testid="login-brand-link" className="text-xl font-semibold tracking-tight text-slate-900">Accountability</span>
            </Link>
            <h2 data-testid="login-title" className="text-3xl font-bold text-slate-900">Sign In to your Account</h2>
            <p data-testid="login-subtitle" className="mt-2 text-slate-500 text-base">Welcome back! please enter your detail</p>
          </div>

          {isDemoMode && (
            <div data-testid="demo-banner" className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4">
              <p className="text-sm font-semibold text-indigo-900">Demo version</p>
              <p className="mt-1 text-sm text-indigo-800">
                This live demo runs on sample data. Sign in with <span className="font-mono">{DEMO_EMAIL}</span> / <span className="font-mono">{DEMO_PASSWORD}</span>, or:
              </p>
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={loading}
                data-testid="demo-access-button"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <PlayCircle className="h-4 w-4" />
                Explore the demo
              </button>
            </div>
          )}

          <form className="mt-8" onSubmit={handleSubmit} autoComplete="on">
            {error && (
              <div data-testid="login-error" className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    data-testid="login-email"
                    type="email"
                    required
                    name="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-13 pr-4 h-14 rounded-xl bg-slate-100 border border-slate-300 focus:border-indigo-500 focus:ring-0 outline-none"
                    placeholder="Email"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    data-testid="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    name="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-13 pr-12 h-14 rounded-xl bg-slate-100 border border-slate-300 focus:border-indigo-500 focus:ring-0 outline-none"
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    data-testid="login-password-toggle"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  data-testid="login-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400"
                />
                Remember me
              </label>
              <Link data-testid="login-forgot-password" to="/forgot-password" className="text-indigo-600 font-medium hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-button"
              className="w-full rounded-lg h-[52px] text-sm mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60 flex items-center justify-center"
            >
              {loading && <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link data-testid="login-signup-link" to="/register" className="text-indigo-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
