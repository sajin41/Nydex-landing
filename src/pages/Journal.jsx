import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';

export const Journal = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/analysis/history/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalyses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOutcome = async (id, outcome) => {
        try {
            const token = localStorage.getItem('token');
            await api.post(`/analysis/${id}/outcome/`, { outcome, pnl: 'Logged' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setAnalyses(analyses.map(a => a.id === id ? { ...a, outcome } : a));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Trading Journal</h1>
                    <p className="text-muted-foreground mt-1">Review your AI-generated trades and track performance.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 animate-pulse text-muted-foreground">Loading journal...</div>
            ) : analyses.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold">No History Found</h3>
                    <p className="text-muted-foreground">Run an analysis in the Dashboard to start tracking.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analyses.map((a) => (
                        <div key={a.id} className="bg-card border border-border rounded-3xl p-6 relative shadow-lg">
                            <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 bg-muted rounded-full uppercase">
                                {new Date(a.created_at).toLocaleDateString()}
                            </div>
                            <h3 className="text-xl font-black tracking-widest">{a.market}</h3>
                            <p className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
                                {a.bias === 'Bullish' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                                {a.bias} Bias ({a.confidence}%)
                            </p>

                            <div className="space-y-2 mb-6">
                                <div className="bg-muted/50 p-3 rounded-xl border border-border/50 text-sm font-mono">
                                    <span className="text-muted-foreground border-b border-border/50 block mb-1 uppercase text-[10px]">Entry Zone</span>
                                    {a.entry_zone}
                                </div>
                                <div className="bg-muted/50 p-3 rounded-xl border border-border/50 text-sm font-mono">
                                    <span className="text-muted-foreground border-b border-border/50 block mb-1 uppercase text-[10px]">Take Profits</span>
                                    {a.targets?.join(', ') || 'N/A'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                {a.outcome === 'Pending' ? (
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold text-center">Was this analysis correct?</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOutcome(a.id, 'Right')} className="flex-1 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 font-bold rounded-xl text-sm transition-colors border border-green-500/20">
                                                Yes (Win)
                                            </button>
                                            <button onClick={() => handleOutcome(a.id, 'Wrong')} className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold rounded-xl text-sm transition-colors border border-red-500/20">
                                                No (Loss)
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`text-center py-2 font-bold uppercase tracking-widest rounded-xl text-sm ${a.outcome === 'Right' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        Outcome: {a.outcome}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
