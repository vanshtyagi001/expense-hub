import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, Receipt, User as UserIcon } from 'lucide-react';
import { Button } from '../components/ui/button';

export function AppLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col md:flex-row font-sans pb-[72px] md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden w-full md:w-64 bg-black text-white p-6 md:flex flex-col md:min-h-screen shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="ExpenseHub" className="w-full h-full object-contain rounded-md" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ExpenseHub</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-white/20 opacity-100' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/groups" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/groups') ? 'bg-white/20 opacity-100' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}>
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

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10 top-safe-area">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
             <img src="/logo.png" alt="ExpenseHub" className="w-full h-full object-contain rounded-md" />
          </div>
          <span className="text-lg font-bold tracking-tight text-black">ExpenseHub</span>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} className="text-gray-500 rounded-full">
          <LogOut size={20} />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#e5e5e5] flex items-center justify-around px-2 pb-safe z-50">
        <Link to="/" className="flex flex-col items-center justify-center w-full h-full gap-1">
          <LayoutDashboard size={22} className={isActive('/') ? 'text-black' : 'text-gray-400'} />
          <span className={`text-[11px] font-medium ${isActive('/') ? 'text-black' : 'text-gray-400'}`}>Home</span>
        </Link>
        <Link to="/groups" className="flex flex-col items-center justify-center w-full h-full gap-1">
          <Users size={22} className={isActive('/groups') ? 'text-black' : 'text-gray-400'} />
          <span className={`text-[11px] font-medium ${isActive('/groups') ? 'text-black' : 'text-gray-400'}`}>Groups</span>
        </Link>
        {/* Placeholder for Expenses/Balances */}
        <Link to="/groups" className="flex flex-col items-center justify-center w-full h-full gap-1 opacity-50">
          <Receipt size={22} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-400">Expenses</span>
        </Link>
        <div className="flex flex-col items-center justify-center w-full h-full gap-1 opacity-50">
          <UserIcon size={22} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-400">Profile</span>
        </div>
      </nav>
    </div>
  );
}
