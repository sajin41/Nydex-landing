import React, { useState } from 'react';
import { Check, Zap, Shield, Crown, X, Loader2 } from 'lucide-react';

const PLANS = [
  { id: 'free', name: 'Free', price: '₹0', period: '/month', features: ['7 analyses per month', 'Basic ICT analysis', 'Community access', 'Email support'], icon: Shield },
  { id: 'basic', name: 'Basic', price: '₹799', period: '/month', features: ['2 analyses per day', 'Entry, Stop Loss & Targets', 'Standard ICT concepts', 'Priority support'], icon: Zap, highlight: true },
  { id: 'pro', name: 'Pro', price: '₹1499', period: '/month', features: ['Unlimited analyses', 'Probability % & Win Rate', 'Detailed ICT Reasoning', 'Trade Review & Mentorship'], icon: Crown }
];

export const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('ideal'); // ideal, processing, success

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setStatus('ideal');
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setStatus('processing');
    setTimeout(() => {
      setIsProcessing(false);
      setStatus('success');
      // Update local plan if needed
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight">Select Your Plan</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Elevate your trading with AI-powered ICT insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`relative bg-card border border-border rounded-3xl p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${plan.highlight ? 'ring-2 ring-primary border-primary/50' : ''}`}>
              {plan.highlight && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-2xl"><Icon className="w-6 h-6 text-primary" /></div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-muted-foreground font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 p-0.5 bg-green-500/20 rounded-full"><Check className="w-3 h-3 text-green-500" /></div>
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => plan.id !== 'free' && handleUpgrade(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all ${plan.id === 'free' ? 'bg-muted text-muted-foreground cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40'}`}
              >
                {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Dummy Razorpay Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            {status !== 'success' && (
              <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
            )}

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <selectedPlan.icon className="w-8 h-8 text-primary" />
              </div>

              {status === 'ideal' && (
                <>
                  <div>
                    <h3 className="text-2xl font-bold">Subscription Demo</h3>
                    <p className="text-muted-foreground text-sm mt-1">Setup your {selectedPlan.name} membership</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-4 flex justify-between items-center">
                    <span className="font-bold">{selectedPlan.name} Plan</span>
                    <span className="text-xl font-black">{selectedPlan.price}<span className="text-xs font-normal">/mo</span></span>
                  </div>
                  <button 
                    onClick={handlePayment}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform active:scale-95"
                  >
                    PROCEED TO PAYMENT
                  </button>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Secure Razorpay Sandbox (Demo Mode)</p>
                </>
              )}

              {status === 'processing' && (
                <div className="py-10 space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                  <p className="font-bold tracking-widest animate-pulse">AUTHORIZING PAYMENT...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="py-6 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-500">Payment Successful!</h3>
                    <p className="text-muted-foreground text-sm mt-1">Your {selectedPlan.name} subscription is now active.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="w-full py-4 bg-foreground text-background rounded-xl font-bold"
                  >
                    GET STARTED
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
