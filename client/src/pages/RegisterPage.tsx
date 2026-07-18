import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import type { ApiResponse } from '@/types/index';
import type { AuthUser } from '@/context/AuthContext';

interface RegisterResponse {
  token: string;
  user: AuthUser;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data } = await api.post<ApiResponse<RegisterResponse>>('/auth/register', {
        name: name.trim(),
        email,
        password,
      });

      if (data.data) {
        login(data.data.token, data.data.user);
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Create account</h1>
            <p className="text-slate-400 text-sm mt-1">Start chatting with your documents</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
                className={`w-full px-3 py-2 bg-slate-900 border rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm ${fieldErrors.name ? 'border-rose-500/60' : 'border-slate-700'}`}
                placeholder="Jane Smith"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-rose-500">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: undefined })); }}
                className={`w-full px-3 py-2 bg-slate-900 border rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm ${fieldErrors.email ? 'border-rose-500/60' : 'border-slate-700'}`}
                placeholder="you@example.com"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-rose-500">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: undefined })); }}
                  className={`w-full px-3 py-2 pr-10 bg-slate-900 border rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm ${fieldErrors.password ? 'border-rose-500/60' : 'border-slate-700'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-rose-500">{fieldErrors.password}</p>}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors mt-2 text-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
