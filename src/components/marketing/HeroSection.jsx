import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Activity, Zap, BarChart2 } from 'lucide-react';
import Typewriter from 'typewriter-effect';

export const HeroSection = () => {
  const containerRef = useRef(null);
  
  // Mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the raw mouse values
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform mouse values into rotation angles (3D tilt)
  // Max rotation: 10 degrees. Adjust mapping limits as needed.
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

  // Transform mouse values into slight translation (parallax)
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate normalized position from -0.5 to 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Reset to center smoothly
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      className="relative min-h-[90vh] flex flex-col items-center pt-32 pb-24 overflow-hidden bg-background"
      style={{ perspective: 1500 }}
    >
      {/* Static ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] md:w-[60%] h-[600px] bg-gradient-radial from-white/10 dark:from-white/5 to-transparent blur-3xl rounded-full opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center justify-center text-center z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto pointer-events-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-sm h-[140px] md:h-[90px] flex items-center justify-center">
            <Typewriter
              options={{ loop: true, delay: 60, deleteSpeed: 40 }}
              onInit={(typewriter) => {
                typewriter
                  .typeString('Your AI Edge in Trading.')
                  .pauseFor(2500)
                  .deleteAll(30)
                  .typeString('Next-Gen AI Trading Platform.')
                  .pauseFor(2500)
                  .deleteAll(30)
                  .typeString('Where AI Meets Smart Trading.')
                  .pauseFor(2500)
                  .deleteAll(30)
                  .start();
              }}
            />
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            NYDEX agents keep analyzing markets 24/7. They capture liquidity, detect bias, and push high-probability scenarios—all while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a 
              href="https://ai.nydex.in" 
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-foreground text-background font-medium text-base transition-all hover:opacity-90 flex items-center justify-center"
            >
              Get NYDEX free
            </a>
            
            <a 
              href="#product"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-base transition-all hover:bg-secondary/80 flex items-center justify-center"
            >
              Request a demo
            </a>
          </div>
        </motion.div>

        {/* Notion-style floating Dashboard Mock up with 3D Interaction */}
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{
            rotateX,
            rotateY,
            x: translateX,
            y: translateY,
            transformStyle: "preserve-3d"
          }}
          className="relative w-full max-w-5xl mx-auto pointer-events-auto"
        >
          {/* Dynamic Background Spotlight following cursor inside box */}
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full bg-primary/5 dark:bg-primary/20 blur-[100px] pointer-events-none -z-10"
            style={{
              x: useTransform(smoothX, [-0.5, 0.5], [-300, 300]),
              y: useTransform(smoothY, [-0.5, 0.5], [-300, 300]),
              top: '20%',
              left: '50%',
              translateX: '-50%'
            }}
          />

          {/* Glowing shadow that shifts counter to the tilt */}
          <motion.div 
            className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-3xl opacity-30 dark:opacity-40 -z-10"
            style={{
              x: useTransform(smoothX, [-0.5, 0.5], [40, -40]),
              y: useTransform(smoothY, [-0.5, 0.5], [40, -40]),
            }}
          />
          
          {/* Mock Window Container */}
          <div className="relative rounded-2xl border border-border bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[500px]">
            
            {/* macOS styled header */}
            <div className="h-12 border-b border-border bg-muted/50 flex items-center px-4 shrink-0">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              </div>
              <div className="flex-1 text-center flex items-center justify-center gap-2">
                 <Activity className="w-4 h-4 text-muted-foreground" />
                 <span className="text-sm font-medium text-muted-foreground">NYDEX Dashboard</span>
              </div>
            </div>
            
            {/* Inner Dashboard Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar Mock */}
              <div className="w-64 border-r border-border bg-card/80 p-4 hidden md:flex flex-col gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-8 w-full bg-secondary rounded flex items-center px-3">
                    <span className="text-xs font-semibold">Active Scenarios</span>
                  </div>
                  <div className="h-8 w-full bg-transparent rounded flex items-center px-3 gap-2 hover:bg-muted/50 transition-colors cursor-pointer cursor-default">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-muted-foreground">EUR/USD Long</span>
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <div className="h-8 w-full bg-muted rounded"></div>
                </div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 bg-background p-6 lg:p-10 overflow-hidden relative">
                <div className="flex items-center gap-3 mb-8 text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex flex-center items-center justify-center"><BarChart2 className="w-5 h-5"/></div>
                  <h2 className="text-2xl font-bold tracking-tight">Market Outlook</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart Mock */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="h-48 rounded-xl border border-border bg-card p-4 relative overflow-hidden flex items-end gap-2 group cursor-crosshair">
                      {/* Animated Bars that react dynamically to generic mouse motion in container */}
                      {[30, 45, 20, 60, 80, 55, 90, 75, 40, 100].map((baseHeight, i) => {
                         // Create a slight ripple effect across bars based on mouse X position
                         const dynamicHeight = useTransform(smoothX, [-0.5, 0.5], [
                            baseHeight * (1 - (i/20)), 
                            baseHeight * (1 + (parseInt(i%3)/10)) 
                         ]);
                         
                         return (
                           <motion.div 
                             key={i} 
                             style={{ height: dynamicHeight }}
                             className={`flex-1 rounded-t-sm transition-colors duration-300 ${i > 5 ? 'bg-primary' : 'bg-muted'} group-hover:bg-primary/80`}
                           />
                         )
                      })}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 rounded-xl border border-border bg-card p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
                         <span className="text-xs font-medium text-muted-foreground">Target Reach</span>
                         <span className="text-lg font-bold text-foreground">1.0450</span>
                      </div>
                      <div className="h-20 rounded-xl border border-border bg-card p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
                         <span className="text-xs font-medium text-muted-foreground">Confidence</span>
                         <span className="text-lg font-bold text-emerald-500">85%</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Response Card Mock */}
                  <div className="h-full rounded-xl border border-border bg-card p-5 relative overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">AI Output</span>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 }}
                        className="p-3 bg-secondary rounded-lg text-xs leading-relaxed text-secondary-foreground"
                      >
                        <strong className="block mb-1 text-primary text-[10px] uppercase">Reasoning</strong>
                        Price swept internal liquidity pools. Expecting macro displacement higher based on recent DXY weakness.
                      </motion.div>
                      
                      <div className="space-y-2 opacity-40">
                        <div className="h-2.5 w-full bg-muted-foreground/30 rounded"></div>
                        <div className="h-2.5 w-5/6 bg-muted-foreground/30 rounded"></div>
                        <div className="h-2.5 w-4/6 bg-muted-foreground/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
};
