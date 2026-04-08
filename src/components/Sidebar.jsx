import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, CreditCard, Settings, BookOpen, Menu, X, LogOut, Clock, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { PaymentHistoryModal } from './payment/PaymentHistoryModal';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: BookOpen, label: 'Trading Journal', path: '/journal' },
  { icon: History, label: 'Analysis History', path: '/history' },
  { icon: CreditCard, label: 'Subscription', path: '/subscription' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me/');
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch sidebar user info", err);
      }
    };
    fetchUser();

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggle}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              NYDEX AI
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggle()}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Nav & Logout */}
          <div className="p-4 border-t border-border mt-auto space-y-4">
            {user && (
              <div 
                onClick={() => setIsPaymentHistoryOpen(true)}
                className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3 animate-in fade-in slide-in-from-bottom-2 cursor-pointer hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">{user.username}</p>
                    <div className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full w-max flex items-center gap-1 mt-1",
                      user.plan_name === 'Pro' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                      user.plan_name === 'Basic' ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                      "bg-zinc-500/20 text-zinc-500 border border-zinc-500/30"
                    )}>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {user.plan_name?.toUpperCase() || 'FREE'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Analyses</span>
                    <span className="text-xs font-black text-foreground">{user.total_analyses || 0}</span>
                  </div>
                  <div className="flex flex-col border-l border-border/30 pl-2">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Tokens</span>
                    <span className="text-xs font-black text-foreground">{user.total_tokens?.toLocaleString() || 0}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/10 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                    <Clock className="w-2.5 h-2.5" />
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium justify-end">
                    <Calendar className="w-2.5 h-2.5" />
                    {time.toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>
              <p className="text-[10px] text-muted-foreground/60 text-center font-medium leading-tight">
                NYDEX AI v2.4 Professional<br/>
                Institutional Analytics Terminal
              </p>
            </div>
          </div>
        </div>
      </aside>

      <PaymentHistoryModal 
        isOpen={isPaymentHistoryOpen}
        onClose={() => setIsPaymentHistoryOpen(false)}
      />
    </>
  );
};
