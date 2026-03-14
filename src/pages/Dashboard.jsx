import React, { useState } from 'react';
import { ChartUpload } from '../components/ChartUpload';
import { ChevronRight, Play, Loader2, AlertCircle, X, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MARKETS = ['NAS100', 'US30', 'SPX', 'GOLD', 'FOREX', 'CRYPTO'];
const STYLES = ['Scalping', 'Intraday', 'Swing'];
const SESSIONS = ['Auto', 'London', 'New York', 'Asian'];

const STYLE_TIMEFRAMES = {
  Scalping: ['4H', '1H', '15M', '5M', '1M'],
  Swing: ['1W', '1D', '4H', '1H'],
  Intraday: ['1D', '4H', '1H', '15M']
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    market: 'NAS100',
    style: 'Scalping',
    session: 'Auto',
    entryPrice: '',
    stopLoss: '',
    customInstruction: ''
  });
  const [charts, setCharts] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleUpload = (tf, file) => {
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
    setIsAnalyzing(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAnalyzing(false);
      navigate('/login');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('market', formData.market);
    formDataToSend.append('trading_style', formData.style);
    formDataToSend.append('session', formData.session);
    if (formData.entryPrice) formDataToSend.append('entry_price', formData.entryPrice);
    if (formData.stopLoss) formDataToSend.append('stop_loss', formData.stopLoss);
    if (formData.customInstruction) formDataToSend.append('custom_instruction', formData.customInstruction);
    
    Object.keys(charts).forEach(tf => {
      formDataToSend.append('charts', charts[tf]);
    });

    // Add user message to conversation
    const userMessage = {
      type: 'user',
      market: formData.market,
      style: formData.style,
      charts: { ...charts },
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      const res = await api.post('analysis/analyze/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const aiMessage = {
        type: 'ai',
        ...res.data,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
      
      // Clear current form state for next analysis
      setCharts({});
      setFormData(prev => ({ ...prev, entryPrice: '', stopLoss: '', customInstruction: '' }));

      // Scroll to bottom
      setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setShowUpgrade(true);
      } else {
        setError(err.response?.data?.error || 'Analysis failed. Please check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-8 pb-32">
      {/* Conversation Area */}
      <div className="space-y-8">
        {conversation.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <h2 className="text-4xl font-black tracking-tight opacity-20">NYDEX AI</h2>
            <p className="text-muted-foreground">Upload your charts and get professional ICT analysis in seconds.</p>
          </div>
        )}

        {conversation.map((msg, idx) => (
          <div key={idx} className={`animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {msg.type === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-muted/50 border border-border rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">U</div>
                    <span className="text-sm font-bold uppercase tracking-wider">{msg.market} • {msg.style}</span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {Object.keys(msg.charts).map(tf => (
                      <div key={tf} className="aspect-square bg-background rounded-lg border border-border overflow-hidden relative group">
                        <img 
                          src={URL.createObjectURL(msg.charts[tf])} 
                          alt={tf} 
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-white">{tf}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[90%] md:max-w-[80%] bg-card border border-primary/20 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <h2 className="text-6xl font-black italic">ICT</h2>
                  </div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{msg.market} Analysis</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{msg.session} SESSION</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${msg.bias === 'Bullish' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {msg.bias}
                      </span>
                      <div className="mt-2 text-4xl font-black text-foreground">
                        {msg.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Entry Zone</h4>
                        <p className="text-lg font-bold font-mono">{msg.entry_zone}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Profit Targets</h4>
                        <div className="flex flex-wrap gap-2">
                          {msg.targets.map((t, i) => (
                            <div key={t} className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 font-mono text-sm">
                              <span className="text-primary font-bold mr-2">TP{i+1}:</span> {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Institutional Reasoning</h4>
                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{msg.reasoning}</p>
                      </div>
                       <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/10">
                        <h4 className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-2 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> Risk Factors
                        </h4>
                        <p className="text-sm italic text-destructive/80">{msg.risk_factors}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">AI is calculating liquidity...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form - Sticky at bottom */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-20 z-20">
        <div className="max-w-4xl mx-auto">
          <section className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-4 lg:p-6 shadow-2xl relative">
            {error && (
              <div className="absolute -top-12 left-0 right-0 bg-destructive/10 text-destructive text-xs font-bold py-2 px-4 rounded-xl border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap gap-4">
                 <select 
                    value={formData.market}
                    onChange={(e) => setFormData({...formData, market: e.target.value})}
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select 
                    value={formData.style}
                    onChange={(e) => setFormData({...formData, style: e.target.value})}
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select 
                    value={formData.session}
                    onChange={(e) => setFormData({...formData, session: e.target.value})}
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {STYLE_TIMEFRAMES[formData.style].map(tf => (
                      <div key={tf} className="relative group">
                         <div className={`h-12 border-2 border-dashed rounded-xl flex items-center justify-center transition-all relative overflow-hidden
                            ${charts[tf] ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                         `}>
                            {charts[tf] ? (
                              <img src={URL.createObjectURL(charts[tf])} className="w-full h-full object-cover opacity-50" />
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground">{tf}</span>
                            )}
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => handleUpload(tf, e.target.files[0])}
                            />
                         </div>
                         {charts[tf] && (
                           <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); clearChart(tf); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full text-[8px] border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                           >✕</button>
                         )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      placeholder="Custom Instruction (Optional): e.g. Focus on liquidity sweeps..."
                      value={formData.customInstruction}
                      onChange={(e) => setFormData({...formData, customInstruction: e.target.value})}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-12"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isAnalyzing || Object.keys(charts).length === 0}
                  className="p-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all transform active:scale-[0.9] disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
              </div>
            </form>
          </section>
          <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em]">
            AI analysis is for educational purposes only. Trade at your own risk.
          </p>
        </div>
      </div>
      {/* Upgrade Popup */}
      {showUpgrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border-2 border-primary/50 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative text-center space-y-8">
            <button onClick={() => setShowUpgrade(false)} className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full">
              <X className="w-6 h-6" />
            </button>
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Crown className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tight">Upgrade Required</h3>
              <p className="text-muted-foreground font-medium">You've reached your free limit of 7 analyses. Upgrade to a pro plan for unlimited access.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/subscription')}
                className="py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform active:scale-95 uppercase tracking-widest"
              >
                View Plans & Upgrade
              </button>
              <button 
                onClick={() => setShowUpgrade(false)}
                className="py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all uppercase tracking-widest text-xs"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
