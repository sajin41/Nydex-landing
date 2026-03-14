import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, BrainCircuit, CalendarClock, Newspaper, Zap } from 'lucide-react';

export const ProductSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const features = [
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Multi-timeframe analysis",
      description: "Correlate price action across multiple timeframes simultaneously to identify macro trends and micro entries."
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "Market bias detection",
      description: "Our AI engine identifies the underlying institutional bias, detecting manipulation, liquidity sweeps, and true displacement."
    },
    {
      icon: <CalendarClock className="w-6 h-6" />,
      title: "Economic calendar awareness",
      description: "Automatically factors upcoming high-impact economic news into its probabilistic modeling."
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: "News-aware reasoning",
      description: "Synthesizes real-time financial news with chart technicals to provide a complete market context."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time market logic",
      description: "Generate instant narrative-driven analysis rather than just lagging indicators or generic support/resistance lines."
    }
  ];

  return (
    <section id="product" className="py-24 bg-background relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center md:max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            NYDEX AI Platform
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            A cohesive intelligence hub mapping complex market conditions into clear, actionable probabilities.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className={`p-8 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg dark:hover:shadow-white/5 ${i === 3 || i === 4 ? 'lg:col-span-1.5' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <a 
            href="https://ai.nydex.in"
            className="px-8 py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
          >
            Open NYDEX AI
          </a>
        </motion.div>
      </div>
    </section>
  );
};
