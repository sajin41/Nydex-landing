import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe, Gift, Loader2, X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const PricingSection = () => {
  const [currency, setCurrency] = useState('INR'); // USD, INR
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly', 'yearly'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [status, setStatus] = useState('ideal'); // ideal, processing, success
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const plans = [
    {
      name: "Normal",
      monthlyINR: 279,
      monthlyUSD: 3.50,
      description: "For active traders developing edge.",
      limit: "100 analyses per day",
      buttonText: "Start Normal",
      popular: true,
      features: [
        "Standard timeframe correlation",
        "Basic market bias",
        "Community support"
      ]
    },
    {
      name: "Institution",
      monthlyINR: 799,
      monthlyUSD: 9.50,
      description: "For funds & institutions (Min $5M volume).",
      limit: "Unlimited + API Access",
      buttonText: "Go Institution",
      popular: false,
      features: [
        "Real-time institutional logic",
        "Instant analysis via API",
        "Custom deployment options",
        "24/7 Dedicated account manager"
      ]
    }
  ];

  const getCalculatedPrice = (plan) => {
    const base = currency === 'INR' ? plan.monthlyINR : plan.monthlyUSD;
    if (billingCycle === 'yearly') {
      return Math.round(base * 12 * 0.87); // 13% discount
    }
    return base;
  };

  const getPriceDisplay = (plan) => {
    const price = getCalculatedPrice(plan);
    return currency === 'INR' ? price.toLocaleString('en-IN') : price.toFixed(2);
  };

  const getFinalAmount = (plan) => {
    let base = getCalculatedPrice(plan);
    if (!appliedCoupon) return base;

    const discValue = Number(appliedCoupon.discount_value) || 0;

    if (appliedCoupon.discount_type === 'percent') {
      return Math.round(base - (base * (discValue / 100)));
    }
    return Math.max(0, Math.round(base - discValue));
  };

  const applyCoupon = async () => {
    setCouponError('');
    try {
      const res = await api.post('/subscriptions/apply-coupon/', { code: couponInput });
      setAppliedCoupon(res.data);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid Coupon');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const currentFinalAmountDisplay = selectedPlan ? (currency === 'INR' ? getFinalAmount(selectedPlan).toLocaleString('en-IN') : getFinalAmount(selectedPlan).toFixed(2)) : 0;

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/register');
      return;
    }
    setStatus('processing');

    try {
      const finalAmount = getFinalAmount(selectedPlan);

      if (finalAmount === 0) {
        // Bypass Razorpay entirely for 100% free coupons
        await api.post('/subscriptions/verify-payment/', {
          razorpay_order_id: 'ORDER_FREE',
          razorpay_payment_id: 'PAY_FREE',
          razorpay_signature: 'SIGNATURE_FREE',
          amount: 0,
          plan_name: selectedPlan.name,
          coupon_code: appliedCoupon ? appliedCoupon.code : null
        }, { headers: { Authorization: `Bearer ${token}` } });

        setStatus('success');
        setTimeout(() => navigate('/app'), 2000);
        return;
      }

      // Load Razorpay Script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please check your connection.");
        setStatus('ideal');
        return;
      }

      // Create Razorpay Order
      const orderRes = await api.post('/subscriptions/create-order/', {
        amount: finalAmount
      }, { headers: { Authorization: `Bearer ${token}` } });

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "NYDEX AI",
        description: `Subscription to ${selectedPlan.name} Plan (${billingCycle})`,
        order_id: orderRes.data.order_id,
        handler: async (response) => {
          try {
            await api.post('/subscriptions/verify-payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: finalAmount,
              plan_name: selectedPlan.name,
              coupon_code: appliedCoupon ? appliedCoupon.code : null
            }, { headers: { Authorization: `Bearer ${token}` } });
            setStatus('success');
            localStorage.setItem('nydex_trial_start', new Date().toISOString());
            localStorage.setItem('nydex_trial_active', 'true');
            setTimeout(() => {
              navigate('/app');
            }, 2000);
          } catch (err) {
            console.error("Verification failed", err);
            setStatus('ideal');
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: "Trader",
          email: localStorage.getItem('nydex_user_email') || "test@example.com",
        },
        theme: { color: "#ffffff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Payment failed", response.error);
        setStatus('ideal');
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setStatus('ideal');
      alert("Failed to initialize payment gateway. " + (err.response?.data?.error || ''));
    }
  };



  // Resets coupon state when modal is closed
  const closeCheckout = () => {
    setSelectedPlan(null);
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setStatus('ideal');
  };

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Choose the plan that fits your trading volume. Upgrade or downgrade at any time.
          </motion.p>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-6 relative z-20">
            <div className="bg-muted/50 p-1 rounded-full border border-border inline-flex relative">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-foreground bg-card shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-foreground bg-card shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Yearly <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:inline-block">Save 13%</span>
              </button>
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="flex justify-center mb-10 relative z-20">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-foreground/50 rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>{currency} ({currency === 'INR' ? '₹' : '$'})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1"
                  >
                    {['INR', 'USD'].map((code) => (
                      <button
                        key={code}
                        onClick={() => { setCurrency(code); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center justify-between ${currency === code ? 'text-primary font-bold bg-muted/20' : 'text-foreground font-medium'}`}
                      >
                        <span>{code}</span>
                        <span className="text-muted-foreground">{code === 'INR' ? '₹' : '$'}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="max-w-2xl mx-auto mb-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">One Month Free Trial</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Use the coupon code below at checkout.</p>
                </div>
              </div>
              <div className="px-5 py-2.5 border border-blue-500/30 bg-blue-500/10 rounded-xl text-blue-500 font-mono font-bold tracking-widest text-lg select-all w-full sm:w-auto text-center shrink-0 border-dashed">
                NYDEXNEW
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl bg-card border ${tier.popular ? 'border-foreground shadow-2xl scale-105 z-10 dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-border/60 hover:border-border'}`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-card-foreground mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground min-h-[40px]">{tier.description}</p>
              </div>

              <div className="mb-8 relative">
                <div className="flex items-baseline gap-1 relative z-10">
                  <span className="text-2xl font-bold text-muted-foreground mr-1">{currency === 'INR' ? '₹' : '$'}</span>
                  <motion.span
                    key={currency + getPriceDisplay(tier) + billingCycle}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-5xl font-extrabold text-foreground"
                  >
                    {getPriceDisplay(tier)}
                  </motion.span>
                  <span className="text-muted-foreground font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border/50 text-sm font-semibold text-foreground text-center">
                  {tier.limit}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(tier);
                  setStatus('ideal');
                }}
                className={`w-full py-3.5 rounded-xl font-semibold text-center transition-all flex items-center justify-center ${tier.popular
                  ? 'bg-foreground text-background hover:opacity-90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none'
                  }`}
              >
                {tier.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Dummy Razorpay Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              {status !== 'success' && (
                <button onClick={closeCheckout} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
              )}

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-black text-primary">{currency === 'INR' ? '₹' : '$'}</span>
                </div>

                {status === 'ideal' && (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {getFinalAmount(selectedPlan) === 0 ? 'Trial Activation' : 'Subscription Checkout'}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {getFinalAmount(selectedPlan) === 0 ? 'Your free version is available!' : `Setup your ${selectedPlan.name} membership`}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-2xl p-4 flex justify-between items-center relative">
                      <span className="font-bold">{selectedPlan.name} Plan ({billingCycle})</span>
                      <div className="text-right flex flex-col items-end">
                        {appliedCoupon && (
                          <span className="text-xs text-muted-foreground line-through mr-1 font-mono">
                            {currency === 'INR' ? '₹' : '$'}{getPriceDisplay(selectedPlan)}
                          </span>
                        )}
                        <span className="text-xl font-black">{currency === 'INR' ? '₹' : '$'}{getFinalAmount(selectedPlan)}<span className="text-xs font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></span>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Promo Code</label>
                      {appliedCoupon ? (
                        <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-3 rounded-xl mt-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-500" />
                            <span className="font-bold text-green-500">
                              {appliedCoupon.code} Applied!
                              <span className="ml-2 text-xs opacity-80">
                                ({appliedCoupon.discount_type === 'percent' ? `-${Number(appliedCoupon.discount_value)}%` : `-${currency === 'INR' ? '₹' : '$'}${Number(appliedCoupon.discount_value)}`})
                              </span>
                            </span>
                          </div>
                          <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-500 uppercase tracking-widest font-bold">Remove</button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="Enter Code..."
                              className="flex-1 bg-background border border-border px-4 py-2 rounded-xl outline-none focus:border-primary"
                            />
                            <button onClick={applyCoupon} className="bg-muted hover:bg-muted/80 text-foreground px-4 font-bold rounded-xl transition-colors shrink-0">Apply</button>
                          </div>
                        </div>
                      )}
                      {couponError && <p className="text-xs text-red-500 font-bold">{couponError}</p>}
                    </div>

                    <button
                      onClick={handlePayment}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      {getFinalAmount(selectedPlan) === 0 ? 'ACTIVATE TRIAL NOW' : 'PAY WITH RAZORPAY'}
                    </button>
                    {getFinalAmount(selectedPlan) === 0 ? (
                      <p className="text-[10px] text-green-500 font-black uppercase tracking-widest animate-pulse">Gift from NYDEX AI Platform</p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Secured by Razorpay Payments</p>
                    )}
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
                      <h3 className="text-2xl font-bold text-green-500">
                        {getFinalAmount(selectedPlan) === 0 ? 'Trial Active!' : 'Payment Successful!'}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {getFinalAmount(selectedPlan) === 0 
                          ? `Your ${selectedPlan.name} trial period has started.` 
                          : `Your ${selectedPlan.name} subscription is now active.`}
                      </p>
                    </div>
                    <button
                      onClick={closeCheckout}
                      className="w-full py-4 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                      RETURN TO DASHBOARD
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
