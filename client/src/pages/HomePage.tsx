import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // While redirecting, render nothing to avoid flash
  if (isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">

        {/* Logo / icon */}
        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto shadow-sm">
          <BrainCircuit className="w-8 h-8 text-indigo-500" />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight">
            AI Knowledge Base
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
            Upload documents and chat with AI to extract insights — instantly.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-left shadow-sm">
            <FileText className="w-6 h-6 text-indigo-500 mb-3" />
            <p className="font-semibold text-slate-200 tracking-tight">Upload Documents</p>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Support for PDF, Markdown, and plain text files. Text is automatically extracted for AI analysis.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-left shadow-sm">
            <MessageSquare className="w-6 h-6 text-indigo-500 mb-3" />
            <p className="font-semibold text-slate-200 tracking-tight">Ask AI Questions</p>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Chat with GPT-3.5 using your document as context. Answers are grounded only in your content.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-md font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </main>
  );
}
