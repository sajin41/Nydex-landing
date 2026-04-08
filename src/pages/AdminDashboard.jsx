import React, { useState, useEffect } from 'react';
import { 
  Users, Tag, CreditCard, BarChart2, Check, X, Plus, Trash2, Edit, 
  Mail, AlertTriangle, Loader2, Eye, Phone, Calendar, History, 
  ChevronDown, ChevronUp, Crown, Sun, Moon, ShieldCheck, CheckCircle2, XCircle, Settings, Shield, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';
import { cn } from '../lib/utils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Audit details modal
  const [auditDetail, setAuditDetail] = useState(null);
  
  // Prompt form
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [promptForm, setPromptForm] = useState({ id: null, label: '', prompt_text: '', is_active: true });
  
  // Advanced Filter state
  const [filterMode, setFilterMode] = useState('yearly'); // 'yearly', 'monthly', 'daily'
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals state
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', text: '', action: null, loading: false });
  const [emailModal, setEmailModal] = useState({ isOpen: false, userId: null, subject: 'Update on NYDEX AI', message: '', loading: false });
  const [userModal, setUserModal] = useState({ isOpen: false, isEdit: false, data: { id: null, username: '', email: '', password: '', plan: 'Free' }, error: '' });
  const [activeUserDetail, setActiveUserDetail] = useState(null);
  const [usageLogs, setUsageLogs] = useState([]);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);

  // Coupon form
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discount_type: 'percent', discount_value: '',
    start_date: '', end_date: '', active: true, max_uses: '', trial_days: ''
  });
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'dark');
  const [couponUsageModal, setCouponUsageModal] = useState({ isOpen: false, couponCode: '', members: [], loading: false });

  const THEME_CONFIG = {
    grid: theme === 'dark' ? '#27272a' : '#d4d4d8',
    text: theme === 'dark' ? '#71717a' : '#000000',
    tooltip: {
      bg: theme === 'dark' ? '#18181b' : '#ffffff',
      border: theme === 'dark' ? '#3f3f46' : '#d1d5db',
      text: theme === 'dark' ? '#ffffff' : '#000000'
    },
    area: {
      gradient: theme === 'dark' ? ['#8b5cf6', 0.6] : ['#8b5cf6', 0.2],
      stroke: '#a78bfa'
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }
    fetchData();
  }, [activeTab, filterMode, filterYear, filterMonth, filterDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get(`/admin/stats/?mode=${filterMode}&year=${filterYear}&month=${filterMonth}&date=${filterDate}`);
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users/');
        setUsers(res.data);
      } else if (activeTab === 'coupons') {
        const res = await api.get('/subscriptions/admin/coupons/');
        setCoupons(res.data);
      } else if (activeTab === 'transactions') {
        const res = await api.get('/subscriptions/admin/transactions/');
        setTransactions(res.data);
      } else if (activeTab === 'audit') {
        const res = await api.get('/analysis/admin/audit/');
        setAuditLogs(res.data);
      } else if (activeTab === 'prompts') {
        const res_p = await api.get('/analysis/admin/prompts/');
        const res_l = await api.get('/analysis/admin/labels/');
        setPrompts(res_p.data);
        setLabels(res_l.data);
      }
    } catch (err) {
      console.error(err);
      setError('System Synchronization Failure: High-latency or Internal Server Error detected.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
      }
    }
    setLoading(false);
  };

  const fetchUsageLogs = async (userId) => {
    setIsUsageLoading(true);
    setShowUsageModal(true);
    try {
      const res = await api.get(`/analysis/admin/users/${userId}/history/`);
      setUsageLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch usage logs', err);
    }
    setIsUsageLoading(false);
  };

  const fetchCouponMembers = async (couponId) => {
    setCouponUsageModal(p => ({ ...p, isOpen: true, loading: true, members: [] }));
    try {
      const res = await api.get(`/subscriptions/admin/coupons/${couponId}/members/`);
      setCouponUsageModal(p => ({ ...p, couponCode: res.data.coupon_code, members: res.data.members, loading: false }));
    } catch (err) {
      console.error('Failed to fetch coupon members', err);
      setCouponUsageModal(p => ({ ...p, loading: false }));
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
  };

  // ---- USER HANDLERS ----
  const handleUserSave = async (e) => {
    e.preventDefault();
    setUserModal(p => ({ ...p, error: '' }));
    try {
      const payload = { ...userModal.data };
      if (!payload.password) delete payload.password;

      if (userModal.isEdit) {
        await api.patch(`/admin/users/${payload.id}/`, payload);
      } else {
        await api.post('/admin/users/', payload);
      }
      setUserModal({ isOpen: false, isEdit: false, data: { id: null, username: '', email: '', password: '', plan: 'Free' }, error: '' });
      fetchData();
    } catch (err) {
      setUserModal(p => ({ ...p, error: err.response?.data?.error || err.response?.data?.username?.[0] || 'Operation failed' }));
    }
  };

  const attemptDeleteUser = (id, username) => {
    if (username.toLowerCase() === 'admin') {
      alert("System Block: You cannot delete the Master Administrator account.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Permanently?',
      text: `Are you absolutely sure you want to delete user "${username}" (ID: ${id})? This will wipe all their data, transactions, and journals immediately.`,
      action: async () => {
        setConfirmDialog(p => ({ ...p, loading: true }));
        try {
          await api.delete(`/admin/users/${id}/`);
          setConfirmDialog({ isOpen: false, title: '', text: '', action: null, loading: false });
          fetchData();
        } catch (err) {
          alert('Delete failed');
          setConfirmDialog(p => ({ ...p, loading: false }));
        }
      }
    });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailModal(p => ({ ...p, loading: true }));
    try {
      await api.post(`/admin/users/${emailModal.userId}/send_email/`, {
        subject: emailModal.subject,
        message: emailModal.message
      });
      setEmailModal({ isOpen: false, userId: null, subject: 'Update on NYDEX AI', message: '', loading: false });
    } catch (err) {
      alert('Failed to send email. Check SMTP settings.');
      setEmailModal(p => ({ ...p, loading: false }));
    }
  };

  // ---- COUPON HANDLERS ----
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...couponForm };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.end_date) delete payload.end_date;
      if (!payload.max_uses) delete payload.max_uses;
      if (!payload.trial_days) delete payload.trial_days;

      await api.post('/subscriptions/admin/coupons/', payload);
      setShowCouponForm(false);
      setCouponForm({ code: '', discount_type: 'percent', discount_value: '', start_date: '', end_date: '', active: true, max_uses: '', trial_days: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error creating coupon');
    }
  };

  const attemptDeleteCoupon = (id, code) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Coupon?',
      text: `Are you sure you want to delete coupon code "${code}"? Existing transactions bound to this coupon will keep their record.`,
      action: async () => {
        setConfirmDialog(p => ({ ...p, loading: true }));
        try {
          await api.delete(`/subscriptions/admin/coupons/${id}/`);
          setConfirmDialog({ isOpen: false, title: '', text: '', action: null, loading: false });
          fetchData();
        } catch (err) {
          alert('Delete failed');
          setConfirmDialog(p => ({ ...p, loading: false }));
        }
      }
    });
  };

  // ---- PROMPT & LABEL HANDLERS ----
  const handlePromptSave = async (e) => {
    e.preventDefault();
    try {
      if (promptForm.id) {
        await api.patch(`/analysis/admin/prompts/${promptForm.id}/`, promptForm);
      } else {
        await api.post('/analysis/admin/prompts/', promptForm);
      }
      setShowPromptForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to deploy directive.');
    }
  };

  const togglePromptStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/analysis/admin/prompts/${id}/`, { is_active: !currentStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Status toggle failed.');
    }
  };

  const handleCreateLabel = async (name) => {
    if (!name) return;
    try {
      await api.post('/analysis/admin/labels/', { name });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Label creation failed.');
    }
  };

  const handleDeleteLabel = async (id) => {
    if (!window.confirm('Delete this UI mapping?')) return;
    try {
      await api.delete(`/analysis/admin/labels/${id}/`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };


  return (
    <div className={cn("min-h-screen transition-all duration-500", theme === 'dark' ? "dark bg-[#0a0a0a] text-white" : "bg-zinc-50 text-zinc-900")}>
      
      {/* HEADER */}
      <header className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg">N</div>
          <div>
            <h1 className="font-black tracking-tighter text-lg">NYDEX ERP</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all active:scale-95 flex items-center justify-center"
            title={theme === 'dark' ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
          </button>
          
          <div className="flex items-center gap-3 px-3 py-1.5 bg-muted rounded-xl border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-[10px]">A</div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black leading-none">Admin</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">

      {/* GLOBAL MODALS */}
      {activeUserDetail && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border shadow-2xl rounded-2xl relative overflow-hidden">
            <button onClick={() => setActiveUserDetail(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Client Details
              </h3>
              <p className="text-xs text-muted-foreground mb-6">Comprehensive record for #{activeUserDetail.id}</p>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground font-bold">Username</span>
                  <span className="font-mono">{activeUserDetail.username}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground font-bold">Email</span>
                  <span>{activeUserDetail.email || 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground font-bold flex items-center gap-1"><Phone className="w-3 h-3"/> Number</span>
                  <span>{activeUserDetail.phone_number || 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground font-bold flex items-center gap-1"><Calendar className="w-3 h-3"/> Joined Date</span>
                  <span>{activeUserDetail.date_joined ? new Date(activeUserDetail.date_joined).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground font-bold flex items-center gap-1"><CreditCard className="w-3 h-3"/> Expiry Date</span>
                  <span className={activeUserDetail.subscription_end_date ? 'text-green-500 font-bold' : ''}>{activeUserDetail.subscription_end_date ? new Date(activeUserDetail.subscription_end_date).toLocaleDateString() : 'Lifetime or Free'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground font-bold flex items-center gap-1"><BarChart2 className="w-3 h-3"/> Analyses (Month)</span>
                  <span className="font-bold">{activeUserDetail.analyses_this_month || 0}</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                 <button onClick={() => fetchUsageLogs(activeUserDetail.id)} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-bold flex items-center gap-2">
                   <History className="w-4 h-4" /> Usage Logs
                 </button>
                <button onClick={() => setActiveUserDetail(null)} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-bold">Close Panel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditDetail && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-5xl h-[85vh] border border-border shadow-2xl rounded-2xl relative overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  Institutional Audit Log #{auditDetail.id}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mt-1">
                  User: {auditDetail.user} • {new Date(auditDetail.created_at).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setAuditDetail(null)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col border-r border-border overflow-hidden">
                   <div className="p-4 bg-muted/10 border-b border-border flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-tighter">System Input Prompt</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                        {auditDetail.prompt_tokens?.toLocaleString()} Tokens
                      </span>
                   </div>
                   <div className={cn(
                     "flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap transition-colors duration-500",
                     theme === 'dark' ? "bg-zinc-950 text-zinc-400" : "bg-zinc-100 text-zinc-700 border-t border-border"
                   )}>
                      {auditDetail.full_prompt || "No prompt record captured for this transaction."}
                   </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                   <div className="p-4 bg-muted/10 border-b border-border flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-tighter">AI Raw Output</span>
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                        {auditDetail.completion_tokens?.toLocaleString()} Tokens
                      </span>
                   </div>
                   <div className={cn(
                     "flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap transition-colors duration-500",
                     theme === 'dark' ? "bg-zinc-950 text-green-500/80" : "bg-zinc-100 text-green-700 border-t border-border"
                   )}>
                      {(() => {
                         try {
                            return auditDetail.raw_response ? JSON.stringify(JSON.parse(auditDetail.raw_response), null, 4) : "No response record captured.";
                         } catch (e) {
                            return auditDetail.raw_response || "Malformed payload data.";
                         }
                      })()}
                   </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {showUsageModal && (
        <div className="fixed inset-0 z-[250] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col border border-border shadow-2xl rounded-2xl relative overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  AI Usage Logs
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Viewing history for {activeUserDetail?.username}
                </p>
              </div>
              <button onClick={() => { setShowUsageModal(false); setUsageLogs([]); setExpandedLogId(null); }} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-muted/30 border-b border-border grid grid-cols-2 gap-4">
               <div>
                  <span className="text-muted-foreground text-xs font-bold uppercase">Total Queries</span>
                  <div className="text-2xl font-black">{usageLogs.length}</div>
               </div>
               <div>
                  <span className="text-muted-foreground text-xs font-bold uppercase">Tokens Consumed</span>
                  <div className="text-2xl font-black">{usageLogs.reduce((acc, log) => acc + (log.tokens_used || 0), 0).toLocaleString()}</div>
               </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isUsageLoading ? (
                 <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : usageLogs.length === 0 ? (
                 <div className="text-center py-10 text-muted-foreground">No analysis history found for this user.</div>
              ) : (
                 usageLogs.map(log => (
                   <div key={log.id} className="border border-border rounded-xl bg-background overflow-hidden">
                     <div 
                       className="p-4 flex flex-wrap items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                       onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                     >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${log.bias === 'Bullish' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <div className="font-bold text-sm">{log.market} • {log.session}</div>
                            <div className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                          <span className="text-xs px-2 py-1 bg-muted rounded-md font-mono">{log.tokens_used || 0} tokens</span>
                          <span className="text-xs font-bold">{log.bias} at {log.confidence}%</span>
                          {expandedLogId === log.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                     </div>
                     
                     {expandedLogId === log.id && (
                       <div className="p-4 border-t border-border bg-muted/10 space-y-4 animate-in fade-in">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                           {log.charts?.map(chart => (
                              <div key={chart.id} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                                <img src={chart.image} className="w-full h-full object-cover" alt="Chart" />
                                <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded">{chart.timeframe}</div>
                              </div>
                           ))}
                         </div>
                         <div className="grid grid-cols-2 text-xs gap-4">
                           <div><span className="text-muted-foreground font-bold font-mono block">Entry:</span> {log.entry_price || 'N/A'}</div>
                           <div><span className="text-muted-foreground font-bold font-mono block">Stop Loss:</span> {log.stop_loss || 'N/A'}</div>
                         </div>
                         <div className="text-xs bg-muted/50 p-3 rounded-lg whitespace-pre-wrap font-mono border border-border">
                           <span className="text-primary font-bold mb-1 block">Institutional Reasoning</span>
                           {log.reasoning}
                         </div>
                       </div>
                     )}
                   </div>
                 ))
              )}
            </div>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 py-8 overflow-y-auto">
          <div className="bg-card w-full max-w-md border border-destructive/30 shadow-2xl shadow-destructive/10 rounded-2xl p-6 relative">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{confirmDialog.title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{confirmDialog.text}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, title: '', text: '', action: null, loading: false })}
                className="px-4 py-2 hover:bg-muted font-bold rounded-lg transition-colors"
                disabled={confirmDialog.loading}
              >Cancel</button>
              <button
                onClick={confirmDialog.action}
                className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 flex items-center gap-2"
                disabled={confirmDialog.loading}
              >
                {confirmDialog.loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {emailModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg border border-border shadow-2xl rounded-2xl relative overflow-hidden">
            <button onClick={() => setEmailModal(p => ({ ...p, isOpen: false }))} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Mail className="w-5 h-5" /> Send Direct Email</h3>
              <p className="text-xs text-muted-foreground mb-6">Dispatch an official SMTP message from noreplay@nydex.in</p>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="text-sm font-bold block mb-1">Subject</label>
                  <input required type="text" className="w-full bg-muted border border-border rounded-xl px-4 py-2 focus:border-primary outline-none" value={emailModal.subject} onChange={e => setEmailModal(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">Body Message</label>
                  <textarea required rows={6} className="w-full bg-muted border border-border rounded-xl px-4 py-2 focus:border-primary outline-none resize-none" value={emailModal.message} onChange={e => setEmailModal(p => ({ ...p, message: e.target.value }))} />
                </div>
                <button type="submit" disabled={emailModal.loading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50">
                  {emailModal.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Broadcast'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {userModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg border border-border shadow-2xl rounded-2xl relative overflow-hidden">
            <button onClick={() => setUserModal(p => ({ ...p, isOpen: false, error: '' }))} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                {userModal.isEdit ? `Edit User #${userModal.data.id}` : 'Create New System User'}
              </h3>
              <p className="text-xs text-muted-foreground mb-6">Manually override profile identifiers and billing status.</p>

              {userModal.error && <p className="text-destructive text-sm bg-destructive/10 p-2 rounded mb-4">{userModal.error}</p>}

              <form onSubmit={handleUserSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold block mb-1">Username</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:border-primary outline-none" value={userModal.data.username} onChange={e => setUserModal(p => ({ ...p, data: { ...p.data, username: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-1">Email</label>
                    <input required type="email" className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:border-primary outline-none" value={userModal.data.email} onChange={e => setUserModal(p => ({ ...p, data: { ...p.data, email: e.target.value } }))} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold block mb-1">
                    Password {userModal.isEdit && <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep unchanged)</span>}
                  </label>
                  <input type="password" required={!userModal.isEdit} placeholder={userModal.isEdit ? "••••••••" : ""} className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:border-primary outline-none" value={userModal.data.password} onChange={e => setUserModal(p => ({ ...p, data: { ...p.data, password: e.target.value } }))} />
                </div>

                <div>
                  <label className="text-sm font-bold block mb-1">Subscription Override</label>
                  <select className="w-full bg-muted border border-border rounded-xl px-4 py-2 focus:border-primary outline-none" value={userModal.data.plan} onChange={e => setUserModal(p => ({ ...p, data: { ...p.data, plan: e.target.value } }))}>
                    <option value="Free">Free / Trial Ended</option>
                    <option value="Basic">Basic Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Institution">Institutional Plan</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-foreground text-background py-3 mt-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
                  {userModal.isEdit ? 'Save Changes' : 'Create User'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* COUPON MEMBERS MODAL */}
      {couponUsageModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCouponUsageModal(p => ({ ...p, isOpen: false }))} />
          <div className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" /> {couponUsageModal.couponCode}
                </h2>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-1">Usage Audit Log</p>
              </div>
              <button onClick={() => setCouponUsageModal(p => ({ ...p, isOpen: false }))} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {couponUsageModal.loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="font-bold animate-pulse text-xs uppercase tracking-tighter">Querying Member Database...</p>
                </div>
              ) : couponUsageModal.members.length > 0 ? (
                <div className="space-y-4">
                  {couponUsageModal.members.map(m => (
                    <div key={m.id} className="p-4 bg-muted/50 border border-border rounded-2xl flex items-center gap-4 hover:bg-muted transition-colors relative group">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                        {m.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-foreground truncate">{m.username}</h4>
                          <span className={cn(
                            "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                            m.current_plan === 'Pro' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            m.current_plan === 'Basic' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                            "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                          )}>
                            {m.current_plan}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Used: {new Date(m.date_used).toLocaleDateString()}
                          </span>
                          {m.plan_expiry && (
                             <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                <History className="w-3 h-3" /> Expires: {new Date(m.plan_expiry).toLocaleDateString()}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <Eye className="w-12 h-12 opacity-20" />
                  <p className="font-bold text-sm">No members found for this code.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      <div className="w-64 border-r border-border p-4 space-y-2 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-card/40 backdrop-blur-xl z-20 transition-all duration-500">
        <h2 className="text-sm font-black mb-6 px-4 text-muted-foreground uppercase tracking-widest">Management</h2>

        <button onClick={() => { setActiveTab('overview'); setError(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm", activeTab === 'overview' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-muted text-muted-foreground')}>
          <BarChart2 className="w-4 h-4" /> Overview
        </button>
        <button onClick={() => { setActiveTab('users'); setError(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm", activeTab === 'users' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-muted text-muted-foreground')}>
          <Users className="w-4 h-4" /> Clients
        </button>
        <button onClick={() => { setActiveTab('coupons'); setError(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm", activeTab === 'coupons' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-muted text-muted-foreground')}>
          <Tag className="w-4 h-4" /> Discounts
        </button>
        <button onClick={() => { setActiveTab('transactions'); setError(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm", activeTab === 'transactions' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-muted text-muted-foreground')}>
          <CreditCard className="w-4 h-4" /> Payments
        </button>
        <div className="pt-4 pb-2 px-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Diagnostics</p>
        </div>
        <button onClick={() => { setActiveTab('audit'); setError(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm", activeTab === 'audit' ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20' : 'hover:bg-muted text-muted-foreground')}>
          <BarChart2 className="w-4 h-4" /> AI Audit Log
        </button>
        <button onClick={() => { setActiveTab('prompts'); setError(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm", activeTab === 'prompts' ? 'bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20' : 'hover:bg-muted text-muted-foreground')}>
          <Settings className="w-4 h-4" /> Prompt Engine
        </button>
      </div>

      {/* MAIN VIEW */}
      <div className="ml-64 flex-1 p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-foreground mb-2">{error}</h2>
                <p className="text-muted-foreground text-sm max-w-md">The platform engine encountered a synchronization fault. Attempting to restore connectivity...</p>
             </div>
             <button onClick={() => { setError(null); fetchData(); }} className="px-8 py-3 bg-foreground text-background font-bold rounded-2xl hover:opacity-90 transition-opacity">
                Retry Connection
             </button>
          </div>
        ) : loading && !stats ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
             <Loader2 className="w-12 h-12 animate-spin text-primary" />
             <p className="font-bold animate-pulse">Initializing Platform Intelligence...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black">Platform Statistics</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-muted p-1 rounded-xl border border-border">
                      {['yearly', 'monthly', 'daily'].map(m => (
                        <button
                          key={m}
                          onClick={() => setFilterMode(m)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter",
                            filterMode === m ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted-foreground/10"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl text-xs font-bold border border-border">
                      {filterMode === 'yearly' && (
                        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="bg-transparent outline-none cursor-pointer text-primary">
                          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      )}
                      
                      {filterMode === 'monthly' && (
                        <>
                          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="bg-transparent outline-none cursor-pointer text-primary">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-transparent outline-none cursor-pointer text-primary border-l border-border pl-2 ml-2">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                              <option key={m} value={i + 1}>{m}</option>
                            ))}
                          </select>
                        </>
                      )}

                      {filterMode === 'daily' && (
                        <input 
                          type="date"
                          value={filterDate}
                          onChange={e => setFilterDate(e.target.value)}
                          className="bg-transparent outline-none cursor-pointer text-primary font-mono"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                    <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">Total Active Clients</p>
                    <h2 className="text-3xl font-black">{stats.total_users}</h2>
                    <p className="text-[10px] text-muted-foreground mt-2">Platform Population</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                    <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">New Registers ({filterMode})</p>
                    <h2 className="text-3xl font-black text-primary">+{stats.scoped_registers}</h2>
                    <p className="text-[10px] text-muted-foreground mt-2">Join Rate Period</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                    <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">Login Activity ({filterMode})</p>
                    <h2 className="text-3xl font-black text-blue-500">{stats.scoped_logins}</h2>
                    <p className="text-[10px] text-muted-foreground mt-2">Active Sessions</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                    <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">Revenue ({filterMode})</p>
                    <h2 className="text-3xl font-black flex items-center tracking-tighter"><span className="text-green-500 mr-1 opacity-50 text-sm">₹</span>{stats.scoped_revenue.toLocaleString()}</h2>
                    <p className="text-[10px] text-muted-foreground mt-2">Period Income</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                    <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">Token Burn (Total)</p>
                    <h2 className="text-3xl font-black text-amber-500">{(stats.total_tokens / 1000).toFixed(1)}k</h2>
                    <p className="text-[10px] text-muted-foreground mt-2">AI Cost Units</p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
                    <p className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">Unpaid Clients</p>
                    <h2 className="text-3xl font-black text-red-500">{stats.unpaid_users}</h2>
                    <p className="text-[10px] text-muted-foreground mt-2">Pending Conversions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> {filterMode === 'yearly' ? filterYear : filterMode === 'monthly' ? `${filterMonth}/${filterYear}` : filterDate} Enrollment Velocity</h3>
                    <div className="h-[320px] w-full min-h-[320px] relative">
                      {stats.chart_data && stats.chart_data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.chart_data}>
                            <defs>
                              <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={THEME_CONFIG.area.stroke} stopOpacity={0.6} />
                                <stop offset="95%" stopColor={THEME_CONFIG.area.stroke} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_CONFIG.grid} />
                            <XAxis dataKey="name" stroke={THEME_CONFIG.text} fontSize={10} tickLine={false} axisLine={{ stroke: THEME_CONFIG.grid }} tick={{dy: 10}} />
                            <YAxis stroke={THEME_CONFIG.text} fontSize={10} tickLine={false} axisLine={false} tick={{dx: -10}} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: THEME_CONFIG.tooltip.bg, 
                                borderRadius: '12px', 
                                border: `1px solid ${THEME_CONFIG.tooltip.border}`, 
                                color: THEME_CONFIG.tooltip.text, 
                                fontWeight: 'bold',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                              }} 
                              itemStyle={{ color: THEME_CONFIG.tooltip.text }}
                            />
                            <Area type="monotone" dataKey="registrations" stroke={THEME_CONFIG.area.stroke} strokeWidth={4} fillOpacity={1} fill="url(#colorReg)" dot={{ r: 4, fill: THEME_CONFIG.area.stroke, strokeWidth: 2, stroke: theme === 'dark' ? '#000' : '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                           <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                           <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Enrollment Data...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-green-500" /> {filterMode === 'yearly' ? filterYear : filterMode === 'monthly' ? `${filterMonth}/${filterYear}` : filterDate} Revenue Trajectory</h3>
                    <div className="h-[320px] w-full min-h-[320px] relative">
                      {stats.chart_data && stats.chart_data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.chart_data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_CONFIG.grid} />
                            <XAxis dataKey="name" stroke={THEME_CONFIG.text} fontSize={10} tickLine={false} axisLine={{ stroke: THEME_CONFIG.grid }} tick={{dy: 10}} />
                            <YAxis stroke={THEME_CONFIG.text} fontSize={10} tickLine={false} axisLine={false} tick={{dx: -10}} />
                            <Tooltip 
                              cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} 
                              contentStyle={{ 
                                backgroundColor: THEME_CONFIG.tooltip.bg, 
                                borderRadius: '12px', 
                                border: `1px solid ${THEME_CONFIG.tooltip.border}`, 
                                color: THEME_CONFIG.tooltip.text, 
                                fontWeight: 'bold' 
                              }} 
                            />
                            <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest animate-pulse font-mono">Auditing Financial Stream...</span>
                         </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 pb-12">
                   <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> Subscription Conversion</h3>
                    <div className="h-[320px] w-full">
                      {stats.billing_distribution && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={stats.billing_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label>
                              {stats.billing_distribution.map((entry, index) => (
                                <Cell key={`cell-billing-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ 
                              backgroundColor: THEME_CONFIG.tooltip.bg, 
                              borderRadius: '12px', 
                              border: `1px solid ${THEME_CONFIG.tooltip.border}`, 
                              color: THEME_CONFIG.tooltip.text, 
                              fontWeight: 'bold' 
                            }} />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-amber-500" /> Intelligence Utilization (Tokens)</h3>
                    <div className="h-[320px] w-full">
                      {stats.chart_data && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.chart_data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_CONFIG.grid} />
                            <XAxis dataKey="name" stroke={THEME_CONFIG.text} fontSize={10} tickLine={false} axisLine={{ stroke: THEME_CONFIG.grid }} tick={{dy: 10}} />
                            <YAxis stroke={THEME_CONFIG.text} fontSize={10} tickLine={false} axisLine={false} tick={{dx: -10}} />
                            <Tooltip 
                              cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} 
                              contentStyle={{ 
                                backgroundColor: THEME_CONFIG.tooltip.bg, 
                                borderRadius: '12px', 
                                border: `1px solid ${THEME_CONFIG.tooltip.border}`, 
                                color: THEME_CONFIG.tooltip.text, 
                                fontWeight: 'bold' 
                              }} 
                            />
                            <Bar dataKey="tokens" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> Plan Distribution (Overall)</h3>
                    <div className="h-72 w-full">
                      {stats.plans_breakdown && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={stats.plans_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {stats.plans_breakdown.map((entry, index) => (
                                <Cell key={`cell-plans-${index}`} fill={['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ 
                              backgroundColor: THEME_CONFIG.tooltip.bg, 
                              borderRadius: '12px', 
                              border: `1px solid ${THEME_CONFIG.tooltip.border}`, 
                              color: THEME_CONFIG.tooltip.text, 
                              fontWeight: 'bold' 
                            }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5 text-blue-500" /> Active Session Tiers ({filterMode})</h3>
                    <div className="h-72 w-full">
                       <div className="flex flex-col items-center justify-center h-full">
                          <h4 className="text-5xl font-black text-primary mb-2">{stats.scoped_logins}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Platform Intersections</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black">Client Management</h1>
                  <button onClick={() => setUserModal({ isOpen: true, isEdit: false, data: { id: null, username: '', email: '', password: '', plan: 'Free' }, error: '' })} className="bg-foreground text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-foreground/90 transition-transform active:scale-95">
                    <Plus className="w-4 h-4" /> New Account
                  </button>
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Service Tier</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-muted-foreground">#{u.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground text-lg">{u.username}</div>
                            <div className="text-xs text-muted-foreground">{u.email || 'No email attached'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 bg-background border rounded-full \${u.plan === 'Free' ? 'text-zinc-500 border-zinc-500/20' : 'text-primary border-primary/20 bg-primary/5'}`}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => setActiveUserDetail(u)} className="text-green-500 hover:text-green-400 p-2 bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors" title="View Full Details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => setEmailModal({ isOpen: true, userId: u.id, subject: 'Account Update on NYDEX AI', message: '', loading: false })} className="text-blue-500 hover:text-blue-400 p-2 bg-blue-500/5 hover:bg-blue-500/10 rounded-lg transition-colors" title="Send Official Email"><Mail className="w-4 h-4" /></button>
                            <button onClick={() => setUserModal({ isOpen: true, isEdit: true, data: { id: u.id, username: u.username, email: u.email, password: '', plan: u.plan }, error: '' })} className="text-foreground hover:text-primary p-2 bg-muted hover:bg-primary/10 rounded-lg transition-colors" title="Edit Profile Details"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => attemptDeleteUser(u.id, u.username)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Irreversibly"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div className="p-8 text-center text-muted-foreground">No accounts found.</div>}
                </div>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black">Marketing Discounts</h1>
                  <button onClick={() => setShowCouponForm(!showCouponForm)} className="bg-foreground text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-foreground/90 transition-transform active:scale-95">
                    {showCouponForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showCouponForm ? 'Cancel Creation' : 'Issue Coupon'}
                  </button>
                </div>

                {showCouponForm && (
                  <form onSubmit={handleCreateCoupon} className="bg-card border border-primary p-6 rounded-2xl space-y-4 mb-8 shadow-primary/10 shadow-lg animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <input required type="text" placeholder="CODE (e.g. NEW10)" className="bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                      <select className="bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}>
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat Amount ($/₹)</option>
                      </select>
                      <input required type="number" step="0.01" placeholder="Value (e.g. 10)" className="bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })} />
                      <input type="number" placeholder="Max Uses (Optional)" className="bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.max_uses} onChange={e => setCouponForm({ ...couponForm, max_uses: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className="text-xs text-muted-foreground ml-1 mb-1 block">Start Date</label><input type="datetime-local" className="w-full bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.start_date} onChange={e => setCouponForm({ ...couponForm, start_date: e.target.value })} /></div>
                      <div><label className="text-xs text-muted-foreground ml-1 mb-1 block">End Date</label><input type="datetime-local" className="w-full bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.end_date} onChange={e => setCouponForm({ ...couponForm, end_date: e.target.value })} /></div>
                      <div><label className="text-xs text-muted-foreground ml-1 mb-1 block">Trial Duration (Days)</label><input type="number" placeholder="Optional (e.g. 7)" className="w-full bg-muted px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" value={couponForm.trial_days} onChange={e => setCouponForm({ ...couponForm, trial_days: e.target.value })} /></div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-transform active:scale-95">
                      Confirm Voucher Issuance
                    </button>
                  </form>
                )}

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Serial Code</th>
                        <th className="px-6 py-4">Reduction</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Validity Epoch</th>
                        <th className="px-6 py-4">Consumption</th>
                        <th className="px-6 py-4 text-right">Extinguish</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {coupons.map(c => (
                        <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-black text-primary tracking-wider">{c.code}</td>
                          <td className="px-6 py-4 font-mono font-bold text-lg">{c.discount_type === 'flat' ? '₹' : ''}{c.discount_value}{c.discount_type === 'percent' ? '%' : ''}</td>
                          <td className="px-6 py-4">
                            {c.is_expired || !c.active ? (
                              <span className="text-red-500 text-xs font-bold px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 flex items-center gap-1 w-max">
                                <X className="w-3 h-3" /> {c.active ? 'Expired' : 'Revoked'}
                              </span>
                            ) : (
                              <span className="text-green-500 text-xs font-bold px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 flex items-center gap-1 w-max">
                                <Check className="w-3 h-3" /> Live
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[10px] text-muted-foreground flex flex-col gap-1 font-medium">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 opacity-50" />
                              <span>Starts: {c.start_date ? new Date(c.start_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Immediate'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <History className="w-3 h-3 opacity-50" />
                              <span>Ends: {c.end_date ? new Date(c.end_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Infinite'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold">
                            <div className="flex items-center gap-3">
                              <span>{c.current_uses} / {c.max_uses || '∞'}</span>
                              {c.current_uses > 0 && (
                                <button 
                                  onClick={() => fetchCouponMembers(c.id)}
                                  className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all group"
                                  title="View Members"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => attemptDeleteCoupon(c.id, c.code)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {coupons.length === 0 && <div className="p-8 text-center text-muted-foreground">No active or expired coupons found in database.</div>}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-black">Financial Logs</h1>
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">TID</th>
                        <th className="px-6 py-4">Account Holder</th>
                        <th className="px-6 py-4">Gross Collected</th>
                        <th className="px-6 py-4">Voucher Match</th>
                        <th className="px-6 py-4">Status & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{t.id}</td>
                          <td className="px-6 py-4 font-bold text-foreground">{t.username}</td>
                          <td className="px-6 py-4 font-black text-lg font-mono">
                            {t.currency === 'INR' ? '₹' : '$'}{t.amount}
                          </td>
                          <td className="px-6 py-4">
                            {t.coupon_code ? (
                              <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md tracking-wider flex items-center gap-1 w-max">
                                <Tag className="w-3 h-3" /> {t.coupon_code}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground block">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className={`font-bold uppercase tracking-wider ${t.status === 'Success' ? 'text-green-500' : 'text-zinc-500'}`}>{t.status}</div>
                            <div className="text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && <div className="p-8 text-center text-muted-foreground">No financial activity to reflect.</div>}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center mb-8">
                   <h1 className="text-3xl font-black">AI Usage Audit</h1>
                   <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-bold">Full Payload Visibility Enabled</span>
                   </div>
                 </div>

                 <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                   <table className="w-full text-left">
                     <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                       <tr>
                         <th className="px-6 py-4">ID</th>
                         <th className="px-6 py-4">Client</th>
                         <th className="px-6 py-4">Market</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Payload</th>
                         <th className="px-6 py-4">Input</th>
                         <th className="px-6 py-4">Output</th>
                         <th className="px-6 py-4">Total</th>
                         <th className="px-6 py-4">Date</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                       {auditLogs?.map(log => (
                         <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-[10px]">#{log.id}</td>
                            <td className="px-6 py-4 font-bold">{log.user}</td>
                            <td className="px-6 py-4 text-xs font-medium">{log.market}</td>
                            <td className="px-6 py-4">
                               <span className={cn(
                                 "flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-full w-max border",
                                 log.status === 'Success' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                               )}>
                                  {log.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {log.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-[10px] font-mono opacity-60">GPT-4o-mini</td>
                            <td className="px-6 py-4">
                               <button 
                                 onClick={() => setAuditDetail(log)}
                                 className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg text-[10px] font-black tracking-widest transition-all"
                               >
                                 INSPECT
                               </button>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">{log.tokens_used?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   {auditLogs.length === 0 && <div className="p-8 text-center text-muted-foreground">No institutional audit logs found.</div>}
                 </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="space-y-8 animate-in fade-in">
                 <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black">Prompt Engine</h1>
                    <button 
                      onClick={() => { setShowPromptForm(!showPromptForm); setPromptForm({ id: null, label: '', prompt_text: '', is_active: true }); }}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm"
                    >
                      {showPromptForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {showPromptForm ? 'Cancel Editor' : 'Master Directive'}
                    </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Prompt Manager */}
                    <div className="lg:col-span-2 space-y-6">
                       {showPromptForm && (
                         <form onSubmit={handlePromptSave} className="bg-card border border-primary p-6 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-top-4">
                            <input 
                              required 
                              placeholder="Logic Label (e.g. Institutional Protocol v2)" 
                              className="w-full bg-muted border border-border px-4 py-3 rounded-xl outline-none focus:border-primary text-sm font-bold" 
                              value={promptForm.label} 
                              onChange={e => setPromptForm({ ...promptForm, label: e.target.value })} 
                            />
                            <textarea 
                              required 
                              rows={12} 
                              placeholder="System Instructions..." 
                              className="w-full bg-muted border border-border px-4 py-3 rounded-xl outline-none focus:border-primary text-[13px] font-mono" 
                              value={promptForm.prompt_text} 
                              onChange={e => setPromptForm({ ...promptForm, prompt_text: e.target.value })} 
                            />
                            <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all">
                              Deploy Directive
                            </button>
                         </form>
                       )}

                       <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                             <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Directives</h3>
                             <span className="text-[10px] font-bold text-amber-500">Only one active allowed*</span>
                          </div>
                          <div className="divide-y divide-border">
                             {prompts?.map(p => (
                               <div key={p.id} className="p-6 flex items-start justify-between gap-6 hover:bg-muted/10 transition-colors">
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-lg">{p.label}</h4>
                                        {p.is_active ? (
                                           <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                                              <Check className="w-2.5 h-2.5" /> Active
                                           </span>
                                        ) : (
                                          <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                                              <X className="w-2.5 h-2.5" /> Standby
                                           </span>
                                        )}
                                     </div>
                                     <p className="text-xs text-muted-foreground line-clamp-3 font-mono opacity-80">{p.prompt_text}</p>
                                     <p className="text-[9px] text-muted-foreground mt-4 uppercase font-black tracking-tighter">Updated: {new Date(p.updated_at).toLocaleString()}</p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                     <button 
                                       onClick={() => { setShowPromptForm(true); setPromptForm(p); }}
                                       className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                     >
                                        <Edit className="w-4 h-4" />
                                     </button>
                                     <button 
                                       onClick={() => togglePromptStatus(p.id, p.is_active)}
                                       className={cn(
                                         "p-2 border rounded-lg transition-colors",
                                         p.is_active ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10" : "border-green-500/30 text-green-500 hover:bg-green-500/10"
                                       )}
                                     >
                                        <ShieldCheck className="w-4 h-4" />
                                     </button>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Image Label Manager */}
                    <div className="space-y-6">
                       <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                             <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                               <History className="w-4 h-4" /> UI Labels
                             </h3>
                             <button 
                               onClick={() => {
                                  const name = prompt("Enter label name (e.g. 15 Minutes Entry Chart):");
                                  handleCreateLabel(name);
                               }}
                               className="p-1 px-3 bg-foreground text-background rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
                             >
                                ADD
                             </button>
                          </div>
                          <div className="p-4 space-y-2">
                             {labels?.map(l => (
                               <div key={l.id} className="p-3 bg-muted/50 rounded-xl border border-border flex items-center justify-between group">
                                  <span className="text-xs font-bold">{l.name}</span>
                                  <button onClick={() => handleDeleteLabel(l.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                     <Trash2 className="w-3 h-3" />
                                  </button>
                               </div>
                             ))}
                             {labels.length === 0 && <p className="text-center text-[10px] py-6 text-muted-foreground">No image labels configured.</p>}
                             <p className="text-[10px] text-muted-foreground p-2 font-medium leading-relaxed italic border-t border-border mt-4">
                               These labels define the column mapping in the institutional analysis terminal.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default AdminDashboard;
