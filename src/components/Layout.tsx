import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Nadzorna ploča' },
    { path: '/settings', icon: SettingsIcon, label: 'Postavke' },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white flex flex-col md:flex-row relative overflow-hidden">
      <div className="bg-glow"></div>
      
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Osmanović Garage" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="font-bold text-white text-sm tracking-tight">OSMANOVIĆ <span className="text-red-600">GARAGE</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white ml-auto">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 glass-panel border-r border-white/10 fixed md:sticky top-[73px] md:top-0 h-[calc(100vh-73px)] md:h-screen z-40`}>
        <div className="hidden md:flex p-6 border-b border-white/10 flex-col items-center justify-center">
          <img src="/logo.png" alt="Osmanović Garage" className="h-16 object-contain mb-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="font-bold text-white text-center tracking-tight">OSMANOVIĆ <span className="text-red-600">GARAGE</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-red-600/20 text-red-400 font-medium border border-red-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-red-400' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut size={18} />
            Odjava
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-73px)] md:h-screen overflow-hidden relative z-10">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
