import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, History, BrainCircuit, ChevronDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-white text-lg hidden sm:block tracking-tight">
            AI Knowledge
          </span>
        </Link>

        {/* Authenticated nav links */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate">{user?.name}</span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-slate-900 border border-slate-800 shadow-md py-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
