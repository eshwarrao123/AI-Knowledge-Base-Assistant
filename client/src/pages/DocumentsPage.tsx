import { FileText, Upload } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-slate-900 pt-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-bold">Documents</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No documents uploaded yet.</p>
          <p className="text-slate-500 text-sm mt-1">Upload a PDF, Markdown, or plain text file to get started.</p>
        </div>
      </div>
    </main>
  );
}
