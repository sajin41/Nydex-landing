import React from 'react';
import { motion } from 'framer-motion';
import { Database, Calendar, Rss, Activity, Cpu, ArrowRight } from 'lucide-react';

export const TechnologySection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const blockVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  const dataSources = [
    { icon: <Database />, title: "Market Data APIs" },
    { icon: <Calendar />, title: "Economic Calendar" },
    { icon: <Rss />, title: "Financial News APIs" },
    { icon: <Activity />, title: "Technical Indicators" },
  ];

  return (
    <section id="technology" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute right-1/4 top-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center md:max-w-2xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            System Architecture
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            How distinct streams of financial data converge into a single, cohesive analysis.
          </motion.p>
        </div>

        <motion.div 
          className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* 1. Data Sources Column */}
          <div className="flex flex-col gap-4 w-full md:w-1/3 z-10">
            {dataSources.map((source, idx) => (
              <motion.div
                key={idx}
                variants={blockVariants}
                className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-4 hover:border-foreground/20 transition-colors shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-foreground font-semibold">
                  {source.icon}
                </div>
                <span className="font-semibold text-card-foreground text-sm">{source.title}</span>
              </motion.div>
            ))}
          </div>

          {/* Flow Arrows (Desktop) */}
          <div className="hidden md:flex flex-col justify-center items-center w-32 relative text-muted-foreground">
            <motion.div 
              animate={{ x: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowRight className="w-8 h-8 opacity-50" />
            </motion.div>
          </div>
          
          {/* Flow Arrows (Mobile) */}
          <div className="md:hidden flex justify-center text-muted-foreground my-4">
             <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
               <ArrowRight className="w-8 h-8 rotate-90 opacity-50" />
             </motion.div>
          </div>

          {/* 2. AI Reasoning Engine */}
          <motion.div 
            variants={blockVariants}
            className="w-full md:w-1/3 z-10 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg transition duration-500 group-hover:from-blue-500/40 group-hover:to-purple-500/40" />
            <div className="relative bg-black border border-white/10 dark:bg-card dark:border-border p-8 rounded-2xl shadow-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white dark:text-foreground">NYDEX AI Engine</h3>
              <p className="text-sm text-gray-400 dark:text-muted-foreground leading-relaxed">
                Large language models tailored with multi-modal vision capabilities for financial charting.
              </p>
            </div>
          </motion.div>

          {/* Flow Arrows (Desktop) */}
          <div className="hidden md:flex flex-col justify-center items-center w-32 left relative text-muted-foreground">
            <motion.div 
              animate={{ x: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
            >
              <ArrowRight className="w-8 h-8 opacity-50" />
            </motion.div>
          </div>

          {/* Flow Arrows (Mobile) */}
          <div className="md:hidden flex justify-center text-muted-foreground my-4">
             <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}>
               <ArrowRight className="w-8 h-8 rotate-90 opacity-50" />
             </motion.div>
          </div>

          {/* 3. Output Column */}
          <motion.div 
            variants={blockVariants}
            className="w-full md:w-1/3 z-10"
          >
             <div className="bg-card border-2 border-primary/20 hover:border-primary/40 rounded-xl p-8 transition-colors shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-card-foreground">Market Analysis</h3>
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-border/50 rounded"></div>
                  <div className="h-2 w-full bg-border/50 rounded"></div>
                  <div className="h-2 w-5/6 bg-border/50 rounded"></div>
                  <div className="h-2 w-4/6 bg-border/50 rounded"></div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-primary font-semibold text-sm">
                  <span>High Probability Scenario Target Reached</span>
                </div>
             </div>
          </motion.div>
          
          {/* Animated linking lines background (optional extra touch) */}
        </motion.div>
      </div>
    </section>
  );
};
