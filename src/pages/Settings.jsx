import React, { useState } from 'react';
import { 
  User, CreditCard, Settings as SettingsIcon, Bell, 
  Palette, Shield, Database, FileText, HelpCircle,
  Camera, Lock, Trash2, Zap, Crown, Globe, 
  Zap as ZapIcon, Brain, TrendingUp, BellRing, 
  Moon, Sun, Type, ShieldCheck, Download, Trash,
  MessageSquare, Bug, ChevronRight, History as HistoryIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'trading', label: 'Trading Preferences', icon: TrendingUp },
  { id: 'ai', label: 'AI Preferences', icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data & Privacy', icon: Database },
  { id: 'legal', label: 'Legal & Support', icon: FileText },
];

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [profile, setProfile] = useState({ name: 'Rocky', email: 'rocky@email.com' });
  const [tradingPrefs, setTradingPrefs] = useState({ market: 'NAS100', style: 'Scalping', session: 'New York', risk: 1 });
  const [aiPrefs, setAiPrefs] = useState({ mode: 'Detailed', strategy: 'ICT Concepts (Internal Range)', news: true, prob: true });
  const [notifications, setNotifications] = useState({ ready: true, news: true, daily: false, billing: true });
  const [fontSize, setFontSize] = useState(16);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-black">{profile.name}</h3>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => alert('Profile updated successfully!')}
                className="flex-1 sm:flex-none px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/10"
              >
                <User className="w-4 h-4" /> Update Profile
              </button>
              <button 
                onClick={() => alert('Password change request sent to email.')}
                className="flex-1 sm:flex-none px-6 py-3 bg-muted text-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muted/80 transition-all font-bold"
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>

            <div className="pt-8 border-t border-border">
              <button className="text-destructive font-black flex items-center gap-2 hover:opacity-80 transition-all uppercase tracking-widest text-[10px]">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-8 bg-card border-2 border-primary/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Basic Plan</h3>
                  <p className="text-muted-foreground text-sm mt-1">Next Billing: <span className="font-bold text-foreground">April 20, 2024</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/subscription')} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Upgrade to Pro
                </button>
                <button className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all">
                  Cancel Plan
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Billing History</h4>
              <div className="border border-border rounded-2xl overflow-hidden">
                {[
                  { id: '1', date: 'Mar 20, 2024', amount: '₹799', status: 'Paid' },
                  { id: '2', date: 'Feb 20, 2024', amount: '₹799', status: 'Paid' },
                ].map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg"><FileText className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold">{invoice.date}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{invoice.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{invoice.amount}</span>
                      <Download className="w-4 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'trading':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Market</label>
                <select 
                  value={tradingPrefs.market}
                  onChange={(e) => setTradingPrefs({...tradingPrefs, market: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option>NAS100</option><option>US30</option><option>SPX</option><option>GOLD</option><option>FOREX</option><option>CRYPTO</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trading Style</label>
                <select 
                  value={tradingPrefs.style}
                  onChange={(e) => setTradingPrefs({...tradingPrefs, style: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option>Scalping</option><option>Intraday</option><option>Swing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Session</label>
                <select 
                  value={tradingPrefs.session}
                  onChange={(e) => setTradingPrefs({...tradingPrefs, session: e.target.value})}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option>New York</option><option>London</option><option>Asian</option><option>Auto</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk % per trade</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={tradingPrefs.risk}
                    onChange={(e) => setTradingPrefs({...tradingPrefs, risk: e.target.value})}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => alert('Trading preferences saved!')}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
            >
              Save Preferences
            </button>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-md">
            <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Analysis Mode</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setAiPrefs({...aiPrefs, mode: 'Detailed'})}
                      className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${aiPrefs.mode === 'Detailed' ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 text-muted-foreground'}`}
                    >Detailed</button>
                    <button 
                      onClick={() => setAiPrefs({...aiPrefs, mode: 'Quick'})}
                      className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${aiPrefs.mode === 'Quick' ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 text-muted-foreground'}`}
                    >Quick</button>
                  </div>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Strategy Framework</h4>
                  <div className="grid gap-2">
                    {['ICT Concepts (Internal Range)', 'Price Action (S&R)', 'Order Flow / Footprint'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setAiPrefs({...aiPrefs, strategy: s})}
                        className={`p-4 rounded-xl border text-left font-bold text-sm transition-all ${aiPrefs.strategy === s ? 'border-primary bg-primary/5' : 'border-border opacity-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-4 pt-4">
                  {[
                    { id: 'news', label: 'Include News Analysis', desc: 'Sync with ForexFactory' },
                    { id: 'prob', label: 'Show Probability %', desc: 'Display confidence score' }
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setAiPrefs({...aiPrefs, [item.id]: !aiPrefs[item.id]})}>
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative p-1 transition-all ${aiPrefs[item.id] ? 'bg-primary' : 'bg-muted border border-border'}`}>
                        <div className={`w-4 h-4 rounded-full transition-all ${aiPrefs[item.id] ? 'bg-primary-foreground ml-auto' : 'bg-muted-foreground'}`} />
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-md">
            <div className="space-y-6">
              {[
                { id: 'ready', label: 'Notify when analysis is ready' },
                { id: 'news', label: 'Alert before major economic news' },
                { id: 'daily', label: 'Daily market bias notification' },
                { id: 'billing', label: 'Subscription & Billing alerts' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id]})}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${notifications[item.id] ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                    {notifications[item.id] && <ShieldCheck className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <span className={`font-bold text-sm ${!notifications[item.id] && 'text-muted-foreground'}`}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Theme Selection</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl">
                {[
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'light', icon: Sun, label: 'Light' },
                ].map(t => (
                   <button 
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${theme === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                   >
                    <t.icon className={`w-8 h-8 ${theme === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-black uppercase tracking-widest text-[10px]">{t.label}</span>
                   </button>
                ))}
                <div className="p-6 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-4 opacity-30 cursor-not-allowed">
                  <Square className="w-8 h-8" />
                  <span className="font-black uppercase tracking-widest text-[10px]">Mono (Legacy)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Settings</h4>
              <div className="flex items-center gap-8 max-w-sm bg-muted rounded-2xl p-4">
                 <Type className="w-4 h-4 text-muted-foreground" />
                 <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="flex-1 accent-primary" 
                />
                 <Type className="w-6 h-6" />
                 <span className="text-xs font-bold text-muted-foreground w-8">{fontSize}px</span>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl">
            <div className="p-6 bg-muted/30 rounded-3xl border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${is2FAEnabled ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                  <Shield className={`w-6 h-6 ${is2FAEnabled ? 'text-green-500' : 'text-destructive'}`} />
                </div>
                <div>
                  <p className="font-bold">Two Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">2FA is currently {is2FAEnabled ? 'enabled' : 'disabled'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${is2FAEnabled ? 'bg-muted text-foreground' : 'bg-foreground text-background'}`}
              >
                {is2FAEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Sessions</h4>
               {[
                 { device: 'Windows PC • Chrome', location: 'London, UK', status: 'Active Now' },
                 { device: 'iPhone 15 Pro • Safari', location: 'London, UK', status: '2 hours ago' },
               ].map((session, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                   <div className="flex items-center gap-3">
                     <Globe className="w-5 h-5 text-muted-foreground" />
                     <div>
                       <p className="text-sm font-bold">{session.device}</p>
                       <p className="text-[10px] text-muted-foreground uppercase">{session.location} • {session.status}</p>
                     </div>
                   </div>
                   {i !== 0 && <button className="text-[10px] font-black text-destructive uppercase">Log out</button>}
                 </div>
               ))}
               <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary pt-2">Logout All Other Devices</button>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-md">
             <div className="grid gap-4">
               <button 
                onClick={() => alert('Exporting data...')}
                className="p-6 bg-muted/30 border border-border rounded-3xl flex items-center justify-between hover:border-primary/50 transition-all text-left group"
               >
                 <div className="flex items-center gap-3">
                   <Download className="w-5 h-5 group-hover:text-primary transition-colors" />
                   <span className="font-bold">Export My Data</span>
                 </div>
                 <ChevronRight className="w-4 h-4" />
               </button>
               <button 
                onClick={() => alert('Analysis history cleared!')}
                className="p-6 bg-muted/30 border border-border rounded-3xl flex items-center justify-between hover:border-destructive/50 transition-all text-left group"
               >
                 <div className="flex items-center gap-3">
                   <HistoryIcon className="w-5 h-5 group-hover:text-destructive transition-colors" />
                   <span className="font-bold group-hover:text-destructive transition-colors">Clear Analysis History</span>
                 </div>
                 <ChevronRight className="w-4 h-4" />
               </button>
               <button 
                onClick={() => alert('Deleting all data... this action is irreversible.')}
                className="p-6 bg-muted/30 border border-border rounded-3xl flex items-center justify-between hover:border-destructive/50 transition-all text-left group"
               >
                 <div className="flex items-center gap-3">
                   <Trash className="w-5 h-5 group-hover:text-destructive transition-colors" />
                   <span className="font-bold group-hover:text-destructive transition-colors">Delete All My Data</span>
                 </div>
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             <div className="p-6 bg-card border border-border rounded-3xl">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your data is encrypted and used solely for personal analysis. We do not sell your data to third parties. 
                  <a href="#" className="underline ml-1">Read our Privacy Policy</a>
                </p>
             </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-md">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-primary/10 rounded-3xl border border-primary/20">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-bold">Live Support</h4>
                  <p className="text-sm text-muted-foreground">support@nydex.in</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'bug', label: 'Report a Bug', icon: Bug },
                  { id: 'tos', label: 'Terms of Service', icon: FileText },
                  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
                  { id: 'help', label: 'Help Center', icon: HelpCircle },
                ].map(item => (
                   <button key={item.id} className="flex items-center gap-3 p-4 hover:bg-muted rounded-2xl transition-all font-bold text-sm">
                     <item.icon className="w-4 h-4 text-muted-foreground" />
                     {item.label}
                   </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">NYDEX AI v1.0.4 r (Beta)</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mt-4 lg:mt-8">
      {/* Settings Navigation */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-1">
          <div className="hidden lg:block">
            <h2 className="text-3xl font-black tracking-tight mb-8">Settings</h2>
          </div>
          
          {/* Mobile Scrollable Nav */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none gap-2">
            {SECTIONS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shrink-0
                  ${activeSection === item.id 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Settings Content Area */}
      <div className="flex-1 min-w-0">
         <div className="max-w-4xl">
            <div className="mb-10 lg:block">
               <h3 className="text-2xl font-black">{SECTIONS.find(s => s.id === activeSection).label}</h3>
               <div className="h-1 w-12 bg-primary mt-3 rounded-full" />
            </div>
            {renderSection()}
         </div>
      </div>
    </div>
  );
};

const Square = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
  </svg>
);
