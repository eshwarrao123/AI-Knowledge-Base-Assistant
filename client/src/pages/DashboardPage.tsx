import { LayoutDashboard, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STATS = [
  { label: 'Documents', value: '0', icon: FileText, color: 'text-indigo-400' },
  { label: 'Conversations', value: '0', icon: MessageSquare, color: 'text-purple-400' },
  { label: 'Queries today', value: '0', icon: TrendingUp, color: 'text-emerald-400' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-900 pt-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, {user?.name} 👋</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No documents yet. Upload one to start chatting.</p>
        </div>
      </div>
    </main>
  );
}
