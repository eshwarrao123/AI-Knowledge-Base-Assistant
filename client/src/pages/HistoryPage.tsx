import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  History, MessageSquare, Search, Trash2, FileText,
  ChevronLeft, ChevronRight, AlertTriangle, Loader2,
} from 'lucide-react';
import { useConversations, useDeleteConversation } from '@/hooks/useConversations';
import { useDocuments } from '@/hooks/useDocuments';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [docFilter, setDocFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data, isLoading } = useConversations({
    page,
    limit: 10,
    search: search || undefined,
    documentId: docFilter || undefined,
  });

  const { data: docsData } = useDocuments({ page: 1, limit: 50 });
  const deleteMutation = useDeleteConversation();

  const conversations = data?.conversations ?? [];
  const pagination = data?.pagination;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 pt-16 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <History className="w-7 h-7 text-indigo-400" />
          <h1 className="text-2xl font-bold">Conversation History</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <select
            value={docFilter}
            onChange={(e) => { setDocFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">All documents</option>
            {docsData?.documents.map((d) => (
              <option key={d._id} value={d._id}>{d.originalName}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className="group flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-xl cursor-pointer transition-all"
                onClick={() => navigate(`/chat/${conv._id}`)}
              >
                <MessageSquare className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{conv.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-400 truncate">{conv.document?.originalName}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 shrink-0">
                  {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(conv._id);
                    setDeleteName(conv.title);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400">Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="font-semibold text-white">Delete Conversation</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Delete &ldquo;<span className="text-white">{deleteName}</span>&rdquo;? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 text-sm transition-colors hover:bg-white/5">Cancel</button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
