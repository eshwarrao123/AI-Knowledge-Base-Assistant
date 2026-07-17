import { Server, Database, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
          MERN Starter Template
        </span>

        {/* Heading */}
        <h1 className="text-5xl font-bold tracking-tight">
          Full-Stack{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Build
          </span>
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed">
          React + Vite + TypeScript on the front.
          Express + MongoDB + TypeScript on the back.
          Start building your feature — the scaffolding is done.
        </p>

        {/* Stack cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Layers, label: 'React 18', sub: 'Vite · TanStack Query · Router' },
            { icon: Server, label: 'Express', sub: 'TypeScript · Helmet · Rate-limit' },
            { icon: Database, label: 'MongoDB', sub: 'Mongoose · dotenv · CORS' },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition-colors"
            >
              <Icon className="w-6 h-6 text-indigo-400 mb-3" />
              <p className="font-semibold text-white">{label}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <p className="text-slate-500 text-sm pt-4">
          Edit <code className="text-indigo-300">client/src/App.tsx</code> or{' '}
          <code className="text-indigo-300">server/src/routes/index.ts</code> to get started.
        </p>
      </div>
    </main>
  );
}
