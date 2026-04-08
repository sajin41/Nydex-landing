import React, { useState, useEffect } from 'react';
import { ChartUpload } from '../components/ChartUpload';
import { ChevronRight, ArrowUp, Loader2, AlertCircle, X, Crown, Check, MessageSquare, Shield, Play, History, Plus, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import api from '../services/api';

const MARKETS = ['NAS100', 'GOLD', 'EURUSD'];
const STYLES = ['Scalping', 'Intraday', 'Swing'];

const STYLE_TIMEFRAMES = {
  Scalping: ['1H', '15M', '5M', '1M'],
  Intraday: ['4H', '1H', '15M'],
  Swing: ['1D', '4H', '1H']
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    market: 'NAS100',
    style: 'Scalping',
    customInstruction: ''
  });
  const [charts, setCharts] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState([]);

  // UI State
  const [isLongWaiting, setIsLongWaiting] = useState(false);
  const [currentLoadingIdx, setCurrentLoadingIdx] = useState(0);
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  
  // Data State
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [configLabels, setConfigLabels] = useState([]);

  const fetchProfile = React.useCallback(async () => {
    try {
      const res = await api.get('/users/me/');
      setUserProfile(res.data);
      if (res.data.has_active_plan === false) {
        setShowTrialExpired(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchHistory = React.useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const url = isArchiveView ? '/analysis/history/archive/' : '/analysis/history/';
      const res = await api.get(url);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
    setIsLoadingHistory(false);
  }, [isArchiveView]);

  const fetchLabels = React.useCallback(async () => {
    try {
      const res = await api.get('/analysis/admin/labels/');
      setConfigLabels(res.data.filter(l => l.is_active));
    } catch (err) {
      console.error("Failed to fetch labels", err);
    }
  }, []);

  const checkServerSubscription = async () => {
    try {
      const res = await api.get('/users/me/');
      if (res.data.has_active_plan === false) {
        setShowTrialExpired(true);
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      setShowTrialExpired(true);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
      fetchHistory();
      fetchLabels();
    } else {
      navigate('/login');
    }
  }, [isArchiveView]);

  useEffect(() => {
    let interval;
    if (isLongWaiting) {
      interval = setInterval(() => {
        setCurrentLoadingIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLongWaiting]);

  const handleUpload = (tf, file) => {
    if (!file) return;
    setCharts(prev => ({ ...prev, [tf]: file }));
  };

  const clearChart = (tf) => {
    setCharts(prev => {
      const { [tf]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredTFs = configLabels.length > 0 ? configLabels.map(l => l.name) : STYLE_TIMEFRAMES[formData.style];
    const uploadedTFs = Object.keys(charts);
    
    if (uploadedTFs.length < requiredTFs.length) {
      setError(`Terminal requirements mandate all ${requiredTFs.length} data streams: ${requiredTFs.join(', ')}`);
      return;
    }
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userMessage = {
      type: 'user',
      market: formData.market,
      style: formData.style,
      charts: { ...charts },
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsAnalyzing(true);

    const formDataToSend = new FormData();
    formDataToSend.append('market', formData.market);
    formDataToSend.append('trading_style', formData.style);
    formDataToSend.append('custom_instruction', formData.customInstruction);

    // Send each chart with a name mapping to its timeframe
    Object.keys(charts).forEach(tf => {
      formDataToSend.append('charts', charts[tf]);
      formDataToSend.append('tf_list', tf);
    });

    try {
      const res = await api.post('/analysis/analyze/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const aiMessage = {
        type: 'ai',
        market: res.data.market,
        bias: res.data.bias,
        confidence: res.data.confidence,
        entry_zone: res.data.entry_zone,
        targets: res.data.targets || [],
        reasoning: res.data.reasoning,
        risk_factors: res.data.risk_factors,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiMessage]);
      setCharts({});
      setFormData(prev => ({ ...prev, customInstruction: '' }));
      fetchHistory(); // Refresh history after successful analysis
    } catch (err) {
      if (err.response?.status === 403) {
        setShowTrialExpired(true);
      } else {
        setError(err.response?.data?.error || 'Failed to analyze trade');
      }
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleNewAnalysis = () => {
    setConversation([]);
    setCharts({});
    setFormData({ market: 'NAS100', style: 'Scalping', customInstruction: '' });
  };

  const loadPastAnalysis = (past) => {
    const aiMessage = {
      ...past,
      type: 'ai',
      isOld: true
    };
    setConversation([aiMessage]);
  };

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className={cn(
      "flex h-screen overflow-hidden selection:bg-primary/20 relative transition-all duration-500",
      theme === 'dark' ? 'dark bg-background text-foreground' : 'bg-[#fafafa] text-zinc-900'
    )}>
      {/* SIDEBAR */}
      <aside className={cn(
        "border-r flex flex-col h-full z-50 transition-all duration-300 ease-in-out relative",
        isSidebarOpen ? 'w-72' : 'w-0 border-none opacity-0',
        theme === 'dark' ? 'bg-card border-border' : 'bg-white border-zinc-200'
      )}>
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-6 left-6 z-[60] w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        {/* Branding */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <h1 className="font-black tracking-tighter text-sm uppercase">NYDEX AI v1.0</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button 
            onClick={handleNewAnalysis}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all group",
              theme === 'dark' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/70' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 shadow-sm'
            )}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Research Audit
          </button>
        </div>

        {/* Archive Toggle / Status */}
        <div className="px-4 py-2 border-b border-border/50 bg-muted/5 flex items-center justify-between">
          <button 
            onClick={() => setIsArchiveView(!isArchiveView)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${isArchiveView ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            {isArchiveView ? <ChevronRight className="w-3 h-3 rotate-180" /> : <History className="w-3 h-3" />}
            {isArchiveView ? 'BACK TO JOURNAL' : 'ARCHIVE FOLDER'}
          </button>
          {isArchiveView && <span className="text-[8px] font-black text-primary animate-pulse">VAULT ACTIVE</span>}
        </div>

        {/* Scrollable History */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 relative">
          <h4 className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 mt-4 flex items-center justify-between">
            {isArchiveView ? 'ARCHIVED AUDITS' : 'RESEARCH JOURNAL'}
            {!isArchiveView && <span className="text-[8px] opacity-40">{history.length} ITEMS</span>}
          </h4>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-10 opacity-20"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : history.length === 0 ? (
            <div className="px-4 py-10 text-[10px] text-muted-foreground italic text-center leading-loose">
              {isArchiveView ? 'Archive vault is empty.' : 'No institutional audits performed yet.'}
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="relative group">
                <button 
                  onClick={() => loadPastAnalysis(item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl hover:bg-muted/50 transition-all group flex flex-col gap-1 border border-transparent ${activeMenuId === item.id ? 'bg-muted border-border/50 scale-[0.98]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider uppercase text-foreground/80 truncate">{item.market}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${item.status === 'Failed' ? 'text-red-500' : item.bias === 'Bullish' ? 'text-green-500' : item.bias === 'Bearish' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {item.status === 'Failed' ? 'FAILED' : item.bias}
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground truncate flex items-center justify-between gap-2 overflow-hidden">
                    <span className="truncate">{new Date(item.created_at).toLocaleDateString()} • {item.trading_style}</span>
                    {item.status === 'Failed' && <AlertCircle className="w-2.5 h-2.5 text-red-500 shrink-0" />}
                  </div>
                    {item.is_archived && <Shield className="w-2.5 h-2.5 opacity-30" />}
                </button>

                {/* Long-Press Action Menu */}
                {activeMenuId === item.id && (
                  <div className="absolute top-0 right-0 z-[70] bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex flex-col min-w-[100px]">
                      {!isArchiveView && (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            await api.post(`/analysis/${item.id}/archive/`);
                            setActiveMenuId(null);
                            fetchHistory();
                          }}
                          className="px-4 py-2 text-[9px] font-black text-foreground hover:bg-primary hover:text-white text-left transition-colors flex items-center gap-2"
                        >
                          <Shield className="w-3 h-3" /> ARCHIVE
                        </button>
                      )}
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if(confirm('Delete this audit permanently?')) {
                            await api.delete(`/analysis/${item.id}/delete/`);
                            setActiveMenuId(null);
                            fetchHistory();
                          }
                        }}
                        className="px-4 py-2 text-[9px] font-black text-red-500 hover:bg-red-500 hover:text-white text-left transition-colors flex items-center gap-2 border-t border-border/50"
                      >
                        <X className="w-3 h-3" /> DELETE
                      </button>
                      <button 
                        onClick={() => setActiveMenuId(null)}
                        className="px-4 py-2 text-[9px] font-black text-muted-foreground hover:bg-muted text-left border-t border-border/50"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Profile Info - BOTTOM SECTION */}
        <div className="p-4 border-t border-border bg-muted/10">
          {userProfile && (
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-3xl border border-border/50 group hover:bg-muted/50 transition-all cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-black text-white shadow-xl">
                 {userProfile.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-foreground">{userProfile.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter 
                    ${userProfile.plan_name.includes('Trial') ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' :
                      userProfile.plan_name === 'Institution' ? 'bg-amber-500/10 text-amber-500' : 
                      userProfile.plan_name === 'Pro' ? 'bg-primary/10 text-primary' : 
                      userProfile.plan_name === 'Basic' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-muted-foreground/10 text-muted-foreground'}
                  `}>
                    {userProfile.plan_name}
                  </span>
                  <span className="text-[8px] text-muted-foreground font-bold">• {userProfile.total_analyses} Logs</span>
                </div>
              </div>
              <button 
                onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Toggle for Closed State */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-6 left-6 z-[60] w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-muted transition-all shadow-lg text-muted-foreground animate-in slide-in-from-left duration-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 overflow-y-auto relative bg-background/50 transition-all duration-300 ${!isSidebarOpen ? 'pl-0' : ''}`}>
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 pb-48">
          {conversation.length === 0 && (
            <div className="text-center py-24 animate-in fade-in zoom-in duration-700">
               <h2 className="text-6xl sm:text-8xl font-black tracking-tighter opacity-[0.03] select-none pointer-events-none">NYDEX</h2>
               <div className="space-y-4 max-w-md mx-auto">
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/40">Terminal Version 1.0</p>
                 <p className="text-muted-foreground text-xs leading-loose italic">Precision Intelligence Layer. Multi-timeframe institutional data aggregation. Risk-weighted ICT protocol active.</p>
               </div>
            </div>
          )}

          {conversation.map((msg, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {msg.type === 'user' ? (
                <div className="flex justify-end mb-6">
                  <div className={cn(
                    "max-w-[70%] border rounded-2xl p-3 space-y-3",
                    theme === 'dark' ? 'bg-muted/20 border-border/40' : 'bg-white border-zinc-200 shadow-sm'
                  )}>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{msg.market} • {msg.style} Request</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 font-mono">
                      {Object.keys(msg.charts).map(tf => (
                        <div key={tf} className="aspect-video bg-background rounded-lg border border-border overflow-hidden relative group">
                          <img src={URL.createObjectURL(msg.charts[tf])} alt={tf} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[8px] font-black text-white tracking-widest opacity-80">{tf}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className={cn(
                    "w-full border rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden transition-all",
                    theme === 'dark' ? 'bg-card border-border hover:border-primary/20' : 'bg-white border-zinc-200 hover:border-zinc-300'
                  )}>
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] select-none pointer-events-none rotate-12">
                      <h2 className="text-9xl font-black italic">ICT</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 relative group">
                             <div className="absolute inset-0 bg-primary/40 animate-pulse rounded-2xl group-hover:scale-110 transition-transform" />
                             <Play className={cn("w-5 h-5 fill-white text-white relative z-10", theme === 'light' && 'fill-white')} />
                          </div>
                          <div>
                            <h3 className={cn("text-lg font-black tracking-tighter uppercase", theme === 'light' ? 'text-zinc-900' : 'text-foreground')}>
                              {msg.market} Audit Result
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Locked Precision</span>
                               <span className="w-1 h-1 bg-muted-foreground rounded-full opacity-30" />
                               <span className={cn("text-[9px] uppercase tracking-widest font-bold", theme === 'light' ? 'text-zinc-500' : 'text-muted-foreground')}>
                                 Session Confirmation: {msg.session || 'Active'}
                               </span>
                            </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                               msg.bias === 'Bullish' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 
                               msg.bias === 'Bearish' ? 'border-red-500/20 text-red-500 bg-red-500/5' : 
                               'border-border text-muted-foreground bg-muted/20'
                             )}>
                               {msg.bias} Bias
                             </span>
                             <div className={cn(
                               "mt-2 text-4xl font-black tracking-tighter flex items-baseline justify-end gap-1",
                               theme === 'light' ? 'text-zinc-900' : 'text-foreground'
                             )}>
                                {msg.confidence} <span className="text-sm opacity-20">%</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       <div className="space-y-8">
                          <div>
                             <h4 className={cn("text-[9px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2", theme === 'light' ? 'text-zinc-400' : 'text-muted-foreground')}>
                                <Shield className="w-3 h-3 text-primary opacity-50" /> Institutional Entry Point
                             </h4>
                             <div className={cn(
                               "text-xl font-black font-mono tracking-tight underline decoration-primary/20 decoration-2 underline-offset-4 leading-normal",
                               theme === 'light' ? 'text-zinc-900' : 'text-foreground'
                             )}>
                                {msg.isOld ? msg.entry_zone : <Typewriter options={{ delay: 15 }} onInit={tw => tw.typeString(msg.entry_zone).start()} />}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Tactical Profit Targets</h4>
                             <div className="space-y-3">
                                {msg.targets.map((t, i) => (
                                  <div key={i} className="flex items-center transition-all group">
                                     <div className="w-10 h-10 border-l border-y border-border flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-all">T{i+1}</div>
                                     <div className="flex-1 h-10 border border-border flex items-center px-4 font-mono font-black text-sm group-hover:border-primary/30 transition-all">
                                        {msg.isOld ? t : <Typewriter options={{ delay: 20 }} onInit={tw => tw.pauseFor(300*i).typeString(t).start()} />}
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div>
                             <h4 className={cn("text-[9px] font-black uppercase tracking-[0.3em] mb-3", theme === 'light' ? 'text-zinc-400' : 'text-muted-foreground')}>Institutional Reasoning</h4>
                             <div className={cn(
                               "text-[11px] leading-relaxed font-medium tracking-wide border-l-2 pl-6 italic",
                               theme === 'light' ? 'text-zinc-600 border-zinc-200' : 'text-muted-foreground border-border'
                             )}>
                                {msg.isOld ? msg.reasoning : (
                                  <Typewriter
                                    options={{ delay: 5 }}
                                    onInit={(tw) => {
                                      tw.typeString(msg.reasoning).callFunction(() => { msg.isOld = true; }).start();
                                    }}
                                  />
                                )}
                             </div>
                          </div>
                          {msg.risk_factors && (
                            <div className="p-4 bg-red-500/5 border-l-2 border-red-500/20 rounded-r-xl">
                               <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Operational Risk</h4>
                               <p className="text-[10px] text-red-500/80 italic font-bold">
                                  {msg.isOld ? msg.risk_factors : <Typewriter options={{ delay: 10 }} onInit={tw => tw.pauseFor(800).typeString(msg.risk_factors).start()} />}
                               </p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
               <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-4 shadow-xl min-w-[320px]">
                  <div className="flex items-center gap-4">
                     <Loader2 className="w-5 h-5 animate-spin text-primary" />
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aggregating Global Data...</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-2/3 animate-[progress_1.5s_infinite]" />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* INPUT BAR - CONTEXT STICKY */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-[40]">
           <div className="max-w-4xl mx-auto">
              <div className={cn(
                "backdrop-blur-xl border rounded-[2.5rem] p-4 shadow-2xl relative",
                theme === 'dark' ? 'bg-card/80 border-border' : 'bg-white/90 border-zinc-200'
              )}>
                  {error && (
                    <div className="absolute -top-12 left-6 right-6 bg-red-500 text-white text-[9px] font-black py-2 px-4 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 uppercase tracking-widest shadow-xl">
                       <AlertCircle className="w-3 h-3" /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                       <select 
                          value={formData.market} 
                          onChange={e => setFormData({...formData, market: e.target.value})}
                          className="bg-muted border border-border rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-1 ring-primary transition-all"
                       >
                          {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                       <select 
                          value={formData.style} 
                          onChange={e => { setFormData({...formData, style: e.target.value}); setCharts({}); }}
                          className="bg-muted border border-border rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase text-primary outline-none focus:ring-1 ring-primary transition-all"
                       >
                          {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                       <input 
                          type="text" 
                          placeholder="Strategic overlay / custom requirements..."
                          className="flex-1 bg-muted border border-border rounded-2xl px-4 py-2.5 text-[10px] font-bold outline-none focus:ring-1 ring-primary italic"
                          value={formData.customInstruction}
                          onChange={e => setFormData({...formData, customInstruction: e.target.value})}
                       />
                    </div>

                    <div className="flex gap-3 items-end">
                       <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(configLabels.length > 0 ? configLabels.map(l => l.name) : STYLE_TIMEFRAMES[formData.style]).map(tf => (
                            <div key={tf} className="relative group aspect-video">
                               <div className={`h-full border border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${charts[tf] ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                  {charts[tf] ? (
                                    <img src={URL.createObjectURL(charts[tf])} className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    <div className="text-center p-1">
                                       <span className="text-[8px] font-black opacity-40 group-hover:opacity-100 transition-all leading-tight truncate block max-w-[80px]">{tf}</span>
                                       <div className="text-[6px] font-black text-muted-foreground tracking-widest mt-0.5">UPLOAD</div>
                                    </div>
                                  )}
                                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleUpload(tf, e.target.files[0])} />
                               </div>
                               {charts[tf] && (
                                 <button type="button" onClick={() => clearChart(tf)} className="absolute -top-1 -right-1 w-4 h-4 bg-background border border-border rounded-full flex items-center justify-center text-[8px] z-10 shadow-sm">✕</button>
                               )}
                            </div>
                          ))}
                       </div>
                       <button 
                          disabled={isAnalyzing}
                          className="h-12 w-12 bg-foreground text-background rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg active:scale-90 disabled:opacity-30"
                       >
                          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5 stroke-[3]" />}
                       </button>
                    </div>
                  </form>
              </div>
           </div>
        </div>
      </main>

      {/* Trial Expired Modal - Integrated */}
      {showTrialExpired && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-card border border-border rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Crown className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">Tier Upgrade Required</h3>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-10 uppercase tracking-widest">Switch to Pro or Institutional plan to activate deep-learning v3 terminal.</p>
              <button 
                onClick={() => navigate('/subscription')}
                className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl text-[10px] tracking-widest uppercase hover:scale-[1.02] shadow-xl transition-all"
              >
                Upgrade Identity
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

