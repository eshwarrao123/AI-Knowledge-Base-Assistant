import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  LayoutDashboard, FileText, MessageSquare, Upload,
  Bot, Clock, TrendingUp, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import { useConversations, useStats } from '@/hooks/useConversations';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <Icon className={`w-5 h-5 ${color} mb-3`} />
      {isLoading ? (
        <div className="h-8 w-16 bg-slate-800 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: docsData, isLoading: docsLoading } = useDocuments({ page: 1, limit: 5 });
  const { data: convsData, isLoading: convsLoading } = useConversations({ page: 1, limit: 5 });
  const { data: stats } = useStats();

  const recentDocs = docsData?.documents ?? [];
  const recentConvs = convsData?.conversations ?? [];

  const docsThisWeek = recentDocs.filter(
    (d) => new Date(d.createdAt) > new Date(Date.now() - 7 * 86400000),
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 pt-16 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Documents" value={stats?.documents ?? docsData?.pagination.total ?? '—'} color="text-indigo-500" isLoading={docsLoading} />
          <StatCard icon={MessageSquare} label="Conversations" value={stats?.conversations ?? convsData?.pagination.total ?? '—'} color="text-emerald-500" isLoading={convsLoading} />
          <StatCard icon={TrendingUp} label="Docs This Week" value={docsThisWeek} color="text-amber-500" isLoading={docsLoading} />
          <StatCard icon={Clock} label="Recent Activity" value={recentConvs[0] ? formatDistanceToNow(new Date(recentConvs[0].updatedAt), { addSuffix: true }) : '—'} color="text-indigo-400" isLoading={convsLoading} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/documents"
            className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group"
          >
            <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-100">Upload Document</p>
              <p className="text-slate-400 text-sm">Add a PDF, TXT, or Markdown file</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            to="/chat"
            className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group"
          >
            <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-100">Ask AI</p>
              <p className="text-slate-400 text-sm">Chat with your documents</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Recent Documents
              </h2>
              <Link to="/documents" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">View all</Link>
            </div>
            {docsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-800 rounded-md animate-pulse" />)}
              </div>
            ) : recentDocs.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No documents yet</p>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div key={doc._id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <p className="text-sm text-slate-300 truncate flex-1">{doc.originalName}</p>
                    <span className="text-xs text-slate-500 shrink-0">
                      {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Conversations */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" /> Recent Chats
              </h2>
              <Link to="/history" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">View all</Link>
            </div>
            {convsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-800 rounded-md animate-pulse" />)}
              </div>
            ) : recentConvs.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {recentConvs.map((conv) => (
                  <Link
                    key={conv._id}
                    to={`/chat/${conv._id}`}
                    className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0 hover:bg-slate-800 rounded-md px-2 -mx-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{conv.title}</p>
                      <p className="text-xs text-slate-500 truncate">{conv.document?.originalName}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
