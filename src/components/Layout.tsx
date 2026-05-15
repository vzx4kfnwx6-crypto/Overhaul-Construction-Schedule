import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { LogOut, Home, ClipboardList, Calendar, CalendarDays, Menu, X, Archive, Users } from "lucide-react";
import { Logo } from "./Logo";

export function Layout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userInitials = user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'US';

  const navLinks = [
    { name: "首頁總覽", path: "/", icon: Home },
    { name: "任務卡列表", path: "/tasks", icon: ClipboardList },
    { name: "工程時程表", path: "/schedule", icon: CalendarDays },
    { name: "工程日曆", path: "/calendar", icon: Calendar },
    { name: "封存項目", path: "/archived", icon: Archive },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
             <Logo className="w-8 h-8" />
             <h1 className="text-lg font-bold tracking-tight text-slate-800">工程時程管理</h1>
          </div>
          <button className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 tracking-wider mb-4 px-2">主選單</div>
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm group",
                  isActive 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600")} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden shrink-0">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="User avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xs font-bold text-slate-600">{userInitials}</span>
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-slate-800 truncate">{user?.displayName || '用戶'}</p>
               <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
             </div>
             <button 
               onClick={signOut}
               className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group shrink-0"
               title="登出系統"
             >
               <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAFC]">
        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg">
               <Menu className="w-5 h-5" />
             </button>
             <span className="font-bold text-slate-900 tracking-tight md:hidden">工程總覽</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
             <Link 
               to="/team" 
               className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors"
             >
               <Users className="w-4 h-4" />
               <span className="hidden sm:inline">團隊協作設定</span>
             </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
