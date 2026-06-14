import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, Receipt } from 'lucide-react';
import { Button } from '../components/ui/button';

export function AppLayout() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white p-6 flex flex-col md:min-h-screen shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full bg-[#00e013] flex items-center justify-center font-bold text-black font-mono">
            EH
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ExpenseHub</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/groups" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
            <Users size={20} />
            <span>Groups</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm truncate pr-2 text-white/70">
            {currentUser.email}
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-white/70 hover:text-white hover:bg-white/10">
            <LogOut size={18} />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
