import React, { useState, useEffect } from 'react';
import { PricingSection } from '../components/marketing/PricingSection';
import { Zap, Download, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const SubscriptionPage = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activePlan, setActivePlan] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await api.get('/users/me/');
        if (res.data.has_active_plan && res.data.plan_name !== 'Free') {
          setIsSubscribed(true);
          setActivePlan(res.data.plan_name);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkPlan();
  }, []);

  if (isLoading) return <div className="p-20 text-center text-muted-foreground animate-pulse text-lg font-bold">Verifying Plan...</div>;

  if (isSubscribed) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-4xl font-black mb-8 text-foreground tracking-tight">Your Subscription</h2>

        <div className="p-8 bg-card border-2 border-primary/30 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-48 h-48" />
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center shadow-inner">
              <Zap className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black">{activePlan} Plan</h3>
                <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-muted-foreground mt-2 font-medium">Full AI Analysis Access • Auto-renews</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
              Manage Billing
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Recent Invoices</h4>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            {[
              { id: '1', date: 'Today', amount: '₹14,999', status: 'Paid', method: 'Razorpay' },
            ].map(invoice => (
              <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border last:border-0 hover:bg-muted/10 transition-colors gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <p className="text-lg font-bold">{invoice.date}</p>
                    <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">{invoice.method} • {invoice.status}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-8">
                  <span className="text-xl font-black">{invoice.amount}</span>
                  <button className="p-3 bg-muted rounded-xl hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mt-4">
      {/* 
        The PricingSection component internally renders "Simple, transparent pricing" 
        along with the currency switchers, promo code banner, and pricing cards.
      */}
      <div className="-mx-4 lg:-mx-8">
        <PricingSection />
      </div>
    </div>
  );
};
