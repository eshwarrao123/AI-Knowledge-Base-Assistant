import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText,
  FileType2,
  File,
  Upload,
  Search,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDocuments, useUploadDocument, useDeleteDocument, usePreviewDocument } from '@/hooks/useDocuments';
import type { Document } from '@/types/document';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getMimeIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return { Icon: FileType2, color: 'text-rose-500', bg: 'bg-slate-800' };
  if (mimeType === 'text/markdown') return { Icon: FileText, color: 'text-emerald-500', bg: 'bg-slate-800' };
  return { Icon: File, color: 'text-indigo-500', bg: 'bg-slate-800' };
}

function getMimeLabel(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType === 'text/markdown') return 'Markdown';
  return 'Text';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-md bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-2/3" />
      </div>
    </div>
  );
}

interface PreviewModalProps {
  docId: string | null;
  onClose: () => void;
}

function PreviewModal({ docId, onClose }: PreviewModalProps) {
  const { data, isLoading } = usePreviewDocument(docId);

  if (!docId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-100 text-lg truncate tracking-tight">
              {data?.originalName ?? 'Preview'}
            </h2>
            {data?.mimeType && (
              <span className="text-xs text-slate-400">{getMimeLabel(data.mimeType)}</span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : data?.content ? (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
              {data.content}
            </pre>
          ) : (
            <p className="text-slate-500 text-center py-8">No content available to preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeleteDialogProps {
  doc: Document | null;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting: boolean;
}

function DeleteDialog({ doc, onConfirm, onClose, isDeleting }: DeleteDialogProps) {
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-sm p-6 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="font-semibold text-slate-100 tracking-tight">Delete Document</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="text-slate-200 font-medium">{doc.originalName}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface DocumentCardProps {
  doc: Document;
  onPreview: (id: string) => void;
  onDelete: (doc: Document) => void;
}

function DocumentCard({ doc, onPreview, onDelete }: DocumentCardProps) {
  const { Icon, color, bg } = getMimeIcon(doc.mimeType);
  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-5 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 font-medium text-sm truncate" title={doc.originalName}>
            {doc.originalName}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">{getMimeLabel(doc.mimeType)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-400">
        <span>{formatSize(doc.size)}</span>
        <span>{formatDate(doc.createdAt)}</span>
        {doc.metadata?.wordCount != null && (
          <span>{doc.metadata.wordCount.toLocaleString()} words</span>
        )}
        {doc.metadata?.pageCount != null && (
          <span>{doc.metadata.pageCount} pages</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPreview(doc._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button
          onClick={() => onDelete(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-slate-800 hover:bg-rose-500/20 text-rose-500 text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const { data, isLoading } = useDocuments({ page, limit: 9, search: debouncedSearch || undefined });
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  // ─── Dropzone ───────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return;
    uploadMutation.mutate(accepted[0], {
      onSuccess: () => showToast('success', 'Document uploaded successfully'),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Upload failed';
        showToast('error', msg);
      },
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => {
        setDeleteTarget(null);
        showToast('success', 'Document deleted');
      },
      onError: () => showToast('error', 'Delete failed'),
    });
  };

  const pagination = data?.pagination;
  const documents = data?.documents ?? [];

  return (
    <main className="min-h-screen bg-slate-950 pt-16 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">My Documents</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {pagination ? `${pagination.total} document${pagination.total !== 1 ? 's' : ''}` : ' '}
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-indigo-500 bg-slate-900'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            ) : (
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-indigo-500' : 'text-slate-500'}`} />
            )}
            <div>
              <p className="text-slate-200 font-medium text-sm">
                {isDragActive
                  ? 'Drop your file here'
                  : uploadMutation.isPending
                  ? `Uploading ${acceptedFiles[0]?.name ?? 'file'}…`
                  : 'Drag & drop or click to upload'}
              </p>
              <p className="text-slate-500 text-xs mt-1">PDF, TXT, or Markdown · Max 10 MB</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">No documents found</p>
            <p className="text-slate-500 text-sm mt-1">
              {debouncedSearch ? 'Try a different search term.' : 'Upload your first PDF, TXT, or Markdown file.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onPreview={setPreviewId}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-md bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2 rounded-md bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <PreviewModal docId={previewId} onClose={() => setPreviewId(null)} />
      <DeleteDialog
        doc={deleteTarget}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-md shadow-sm text-sm font-medium transition-colors ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </main>
  );
}
