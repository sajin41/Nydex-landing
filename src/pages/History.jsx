import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History as HistoryIcon, ChevronRight, Calendar, X, Play, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('analysis/history/');
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading History...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <HistoryIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Analysis History</h2>
          <p className="text-muted-foreground text-sm">Review your institutional market insights.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
               <HistoryIcon className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground font-medium">No analyses yet. Start by analyzing a trade on the dashboard!</p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl
                    ${item.bias === 'Bullish' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                  `}>
                    {item.bias[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{item.market}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.created_at || new Date()), 'PPP')}
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold uppercase tracking-wider">{item.session} Session</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-10">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Confidence</p>
                    <p className="text-3xl font-black text-foreground">
                      {item.confidence}%
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-8 md:p-12 scrollbar-none">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-6 right-6 p-3 hover:bg-muted rounded-2xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-10">
               {/* Header */}
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <Play className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{selectedItem.market} Analysis</h3>
                      <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-xs mt-1">{selectedItem.session} SESSION • {format(new Date(selectedItem.created_at || new Date()), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest ${selectedItem.bias === 'Bullish' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {selectedItem.bias}
                    </span>
                    <div className="mt-3 text-5xl font-black text-foreground">
                      {selectedItem.confidence}%
                    </div>
                  </div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="p-6 bg-muted/50 rounded-3xl border border-border/50">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Institutional Entry Zone</h4>
                      <p className="text-2xl font-black font-mono tracking-tight">{selectedItem.entry_zone}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Profit Objectives</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedItem.targets?.map((t, i) => (
                          <div key={t} className="px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10 font-mono text-lg shadow-sm">
                            <span className="text-primary font-black mr-2">TP{i+1}:</span> {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedItem.charts && selectedItem.charts.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Uploaded Charts</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedItem.charts.map((c, i) => (
                            <div key={i} className="aspect-video bg-muted rounded-xl border border-border overflow-hidden">
                              <img src={c.image} alt="Chart" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                     <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Market Narrative</h4>
                      <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">{selectedItem.reasoning}</p>
                    </div>
                     <div className="p-6 bg-destructive/5 rounded-3xl border border-destructive/10">
                      <h4 className="text-[10px] font-black text-destructive uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Risk Assessment
                      </h4>
                      <p className="text-sm font-medium italic text-destructive/80 leading-relaxed">{selectedItem.risk_factors}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
