import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unable to send recovery email');
      }

      navigate('/auth/login', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unable to send recovery email');
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
            <h2 className="text-3xl font-bold text-slate-900">Forgot Password</h2>
            <p className="mt-2 text-slate-500 text-base">
              Enter the email address associated with your account and we will send you a link to reset your password.
            </p>
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg h-[52px] text-sm mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60 flex items-center justify-center"
            >
              {loading && <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />}
              {loading ? 'Sending Recovery Email...' : 'Send Recovery Email'}
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              Remembered your password?{' '}
              <Link to="/auth/login" className="text-indigo-600 font-semibold hover:underline">
                Back to Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
