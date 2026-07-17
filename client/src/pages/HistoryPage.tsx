import { History, MessageSquare } from 'lucide-react';

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-slate-900 pt-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <History className="w-7 h-7 text-indigo-400" />
          <h1 className="text-2xl font-bold">Conversation History</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No conversations yet.</p>
          <p className="text-slate-500 text-sm mt-1">Start chatting with a document to see your history here.</p>
        </div>
      </div>
    </main>
  );
}
