import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import {
  Bot, Send, FileText, Menu, X, Plus, Search,
  Trash2, Loader2, AlertTriangle, BrainCircuit, ChevronDown,
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import {
  useConversations, useConversation,
  useAskQuestion, useDeleteConversation,
} from '@/hooks/useConversations';
import type { Message } from '@/types/conversation';

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-slate-300" />
      </div>
      <div className="bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5 shadow-sm">
        {[0,1,2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-slate-800'}`}>
        {isUser ? <span className="text-white text-xs font-bold">U</span> : <Bot className="w-4 h-4 text-slate-300" />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 shadow-sm text-sm ${isUser ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md' : 'bg-slate-800 text-slate-300 rounded-2xl rounded-bl-md'}`}>
        {isUser ? (
          <p className="leading-relaxed">{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 text-slate-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-xs mt-1.5 ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeConvId?: string;
  onNew: () => void;
}

function Sidebar({ open, onClose, activeConvId, onNew }: SidebarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { data } = useConversations({ limit: 50, search: search || undefined });
  const deleteMutation = useDeleteConversation();
  const conversations = data?.conversations ?? [];

  return (
    <>
      {/* Overlay (mobile) */}
      {open && <div className="fixed inset-0 z-30 bg-slate-950/80 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-16 left-0 bottom-0 z-40 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <span className="font-semibold text-slate-100 text-sm tracking-tight">Conversations</span>
          <button onClick={onNew} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-6">No conversations yet</p>
          ) : conversations.map((conv) => (
            <div
              key={conv._id}
              className={`group flex items-start gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-900 transition-colors ${activeConvId === conv._id ? 'bg-slate-900 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
              onClick={() => { navigate(`/chat/${conv._id}`); onClose(); }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{conv.title}</p>
                <p className="text-xs text-slate-500 truncate">{conv.document?.originalName}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(conv._id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-500 transition-colors shrink-0 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Delete confirm (inline) */}
        {deleteTarget && (
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <p className="text-xs text-slate-300 mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Delete this conversation?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-1.5 text-xs rounded-md border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={() => { deleteMutation.mutate(deleteTarget, { onSuccess: () => { setDeleteTarget(null); if (activeConvId === deleteTarget) navigate('/chat'); } }); }}
                disabled={deleteMutation.isPending}
                className="flex-1 py-1.5 text-xs rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1 font-medium transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Document selector ────────────────────────────────────────────────────────

function DocumentSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const { data } = useDocuments({ page: 1, limit: 50 });
  const docs = data?.documents ?? [];

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <BrainCircuit className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">Select a Document</h2>
        <p className="text-slate-400 text-sm mb-6">Choose a document to start asking questions</p>
        {docs.length === 0 ? (
          <p className="text-slate-500 text-sm">No documents found. Upload one first.</p>
        ) : (
          <div className="space-y-2 text-left">
            {docs.map((doc) => (
              <button
                key={doc._id}
                onClick={() => onSelect(doc._id)}
                className="w-full flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors text-left shadow-sm"
              >
                <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{doc.originalName}</p>
                  <p className="text-xs text-slate-500">{doc.mimeType}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 ml-auto -rotate-90" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat area ────────────────────────────────────────────────────────────────

interface ChatAreaProps {
  docId: string;
  convId?: string;
  onConvCreated: (id: string) => void;
}

function ChatArea({ docId, convId, onConvCreated }: ChatAreaProps) {
  const { data: docsData } = useDocuments({ page: 1, limit: 50 });
  const { data: convData } = useConversation(convId ?? null);
  const askMutation = useAskQuestion();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const docName = docsData?.documents.find(d => d._id === docId)?.originalName ?? 'Document';

  // Load messages from fetched conversation
  useEffect(() => {
    if (convData?.conversation?.messages) {
      setMessages(convData.conversation.messages as Message[]);
    }
  }, [convData]);

  // Reset when switching to new chat
  useEffect(() => {
    if (!convId) setMessages([]);
  }, [convId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
  }, []);

  const extractErrorMsg = (err: unknown): string => {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    if (e?.response?.data?.message) return e.response.data.message;
    if (e?.message === 'Network Error') return 'Cannot connect to server. Please check your connection.';
    if (e?.message) return e.message;
    return 'Something went wrong. Please try again.';
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q || isAsking) return;

    const optimistic: Message = { role: 'user', content: q, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setIsAsking(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    askMutation.mutate(
      { documentId: docId, question: q, conversationId: convId },
      {
        onSuccess: (data) => {
          if (!data) return;
          const aiMsg: Message = { role: 'assistant', content: data.answer, timestamp: new Date().toISOString() };
          setMessages(prev => [...prev, aiMsg]);
          if (!convId) onConvCreated(data.conversationId);
          setIsAsking(false);
        },
        onError: (err) => {
          // Keep the user message visible so they can see context while retrying
          setIsAsking(false);
          showToast(extractErrorMsg(err));
          // Refocus textarea so user can retry immediately
          setTimeout(() => textareaRef.current?.focus(), 100);
        },
      },
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
      {/* Header */}
      <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0 bg-slate-950">
        <FileText className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-medium text-slate-200 truncate">{docName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {messages.length === 0 && !isAsking && (
          <div className="text-center py-12 text-slate-500 text-sm">
            <Bot className="w-8 h-8 mx-auto mb-3 text-slate-600" />
            Ask anything about <span className="text-slate-400 font-medium">{docName}</span>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {isAsking && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-8 py-4 border-t border-slate-800 shrink-0 bg-slate-950">
        <div className="flex items-end gap-3 bg-slate-900 border border-slate-700 rounded-md px-4 py-3 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask a question about this document…"
            disabled={isAsking}
            rows={1}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAsking}
            className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:cursor-not-allowed text-white transition-colors shrink-0"
          >
            {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">Shift+Enter for new line · Enter to send</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-500 text-white text-sm px-4 py-3 rounded-md shadow-sm flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { conversationId: urlConvId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeConvId, setActiveConvId] = useState<string | undefined>(urlConvId);

  // Load doc from existing conversation
  const { data: convData } = useConversation(urlConvId ?? null);
  useEffect(() => {
    if (convData?.conversation?.document?._id) {
      setSelectedDocId(convData.conversation.document._id);
    }
    setActiveConvId(urlConvId);
  }, [urlConvId, convData]);

  const handleNew = () => {
    setSelectedDocId('');
    setActiveConvId(undefined);
    navigate('/chat');
    setSidebarOpen(false);
  };

  const handleConvCreated = (id: string) => {
    setActiveConvId(id);
    navigate(`/chat/${id}`, { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 pt-16">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeConvId={activeConvId}
        onNew={handleNew}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Mobile nav toggle */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 lg:hidden bg-slate-950">
          <button onClick={() => setSidebarOpen(o => !o)} className="text-slate-400 hover:text-slate-200 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-sm text-slate-100 tracking-tight">Chat</span>
        </div>

        {selectedDocId ? (
          <ChatArea
            key={activeConvId ?? selectedDocId}
            docId={selectedDocId}
            convId={activeConvId}
            onConvCreated={handleConvCreated}
          />
        ) : (
          <DocumentSelector onSelect={setSelectedDocId} />
        )}
      </div>
    </div>
  );
}
