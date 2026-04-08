import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const PaymentHistoryModal = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscriptions/history/');
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch payment history", err);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-card w-full max-w-2xl border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Billing History</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Transaction Ledger</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-bold uppercase tracking-tighter animate-pulse">Syncing payment records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground">You haven't made any payments yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border",
                      tx.status === 'Success' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      tx.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {tx.status === 'Success' ? <CheckCircle2 className="w-5 h-5" /> :
                       tx.status === 'Pending' ? <Clock className="w-5 h-5" /> :
                       <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight">{tx.subscription_plan || 'NYDEX PRO'}</span>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest",
                          tx.status === 'Success' ? "bg-green-500/20 text-green-500" :
                          tx.status === 'Pending' ? "bg-amber-500/20 text-amber-500" :
                          "bg-red-500/20 text-red-500"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">₹{tx.amount}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">{tx.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted/10">
          <p className="text-[10px] text-muted-foreground text-center font-medium">
            Transactions are processed securely via Razorpay. Support: support@nydex.in
          </p>
        </div>
      </div>
    </div>
  );
};
