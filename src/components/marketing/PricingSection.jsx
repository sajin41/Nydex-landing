import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe, Gift } from 'lucide-react';

const rates = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  INR: { symbol: '₹', rate: 83.50 }
};

export const PricingSection = () => {
  const [currency, setCurrency] = useState('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatPrice = (price) => {
    if (price === 0) return '0';
    const converted = price * rates[currency].rate;
    // For INR, omit decimals. For others, keep 2 decimal places.
    return currency === 'INR' ? Math.round(converted).toLocaleString() : converted.toFixed(2);
  };

  const tiers = [
    {
      name: "Basic",
      basePrice: 7,
      period: "/month",
      description: "For active traders developing edge.",
      limit: "2 analyses per day",
      buttonText: "Start Basic",
      popular: false,
      features: [
        "Standard timeframe correlation",
        "Basic market bias",
        "Community support"
      ]
    },
    {
      name: "Advanced",
      basePrice: 16,
      period: "/month",
      description: "For serious traders requiring depth.",
      limit: "Unlimited analyses",
      buttonText: "Get Advanced",
      popular: true,
      features: [
        "Advanced timeframe correlation",
        "News & calendar integration",
        "Priority queue",
        "Email support"
      ]
    },
    {
      name: "Institutional",
      basePrice: 49,
      period: "/month",
      description: "For funds & institutions (Min $5M volume).",
      limit: "Unlimited + API Access",
      buttonText: "Contact Sales",
      popular: false,
      features: [
        "Real-time institutional logic",
        "Instant analysis via API",
        "Custom deployment options",
        "24/7 Dedicated account manager"
      ]
    }
  ];

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

          {/* Currency Switcher */}
          <div className="flex justify-center mb-10 relative z-20">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-foreground/50 rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>{currency} ({rates[currency].symbol})</span>
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
                    {Object.keys(rates).map((code) => (
                      <button
                        key={code}
                        onClick={() => { setCurrency(code); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center justify-between ${currency === code ? 'text-primary font-bold bg-muted/20' : 'text-foreground font-medium'}`}
                      >
                        <span>{code}</span>
                        <span className="text-muted-foreground">{rates[code].symbol}</span>
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
          {tiers.map((tier, i) => (
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
                  <span className="text-2xl font-bold text-muted-foreground mr-1">{rates[currency].symbol}</span>
                  <motion.span 
                    key={currency + tier.basePrice}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-5xl font-extrabold text-foreground"
                  >
                    {formatPrice(tier.basePrice)}
                  </motion.span>
                  {tier.period && <span className="text-muted-foreground font-medium">{tier.period}</span>}
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

              <a 
                href="https://ai.nydex.in/pricing"
                className={`w-full py-3.5 rounded-xl font-semibold text-center transition-all flex items-center justify-center ${
                  tier.popular 
                  ? 'bg-foreground text-background hover:opacity-90' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {tier.buttonText}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
