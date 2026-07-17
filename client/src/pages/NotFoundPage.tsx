import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <AlertCircle className="w-16 h-16 text-indigo-400 mb-6" />
      <h1 className="text-4xl font-bold mb-3">404 — Page Not Found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}
