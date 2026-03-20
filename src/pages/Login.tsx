import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@portal.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user, rememberMe);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white lg:flex">
      <div className="hidden lg:w-1/2 lg:flex bg-white" />

      <div className="lg:w-1/2 py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[464px] mx-auto w-full">
          <div>
            <Link to="/auth/login" className="mb-3 inline-flex items-center gap-3">
              <span className="text-xl font-semibold tracking-tight text-slate-900">Accountability</span>
            </Link>
            <h2 className="text-3xl font-bold text-slate-900">Sign In to your Account</h2>
            <p className="mt-2 text-slate-500 text-base">Welcome back! please enter your detail</p>
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-13 pr-4 h-14 rounded-xl bg-slate-100 border border-slate-300 focus:border-indigo-500 focus:ring-0 outline-none"
                    placeholder="Email"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-13 pr-12 h-14 rounded-xl bg-slate-100 border border-slate-300 focus:border-indigo-500 focus:ring-0 outline-none"
                    placeholder="Password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400"
                />
                Remember me
              </label>
              <Link to="/auth/forgot-password" className="text-indigo-600 font-medium hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg h-[52px] text-sm mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60 flex items-center justify-center"
            >
              {loading && <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/auth/register" className="text-indigo-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
