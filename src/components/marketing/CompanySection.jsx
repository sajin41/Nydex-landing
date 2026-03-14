import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Users, ArrowRight } from 'lucide-react';

export const CompanySection = () => {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Background Particles Simulation using SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" className="fill-muted-foreground" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              About NYDEX
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Intelligence built for clarity.
            </h2>
            
            <div className="prose prose-lg dark:prose-invert text-muted-foreground">
              <p className="mb-4">
                NYDEX is building intelligent AI systems designed to analyze financial markets with speed, clarity, and precision. We believe that professional-grade market intelligence shouldn't require complex dashboards and confusing indicators.
              </p>
              <p className="font-semibold text-foreground mb-8">
                Our mission is to empower traders with advanced AI reasoning tools that cut through the noise and deliver high-probability scenarios.
              </p>
            </div>
            
            <a href="https://ai.nydex.in" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-foreground transition-colors group">
              Read our manifesto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            {/* Animated Contact Card within the About section for a unified look */}
            <div className="bg-card border border-border/60 hover:border-border p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 w-full max-w-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <Users className="w-32 h-32" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Get in touch</h3>
              <p className="text-muted-foreground mb-8 text-sm">Have questions about Enterprise plans or API access?</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-foreground">Support & Inquiries</h4>
                    <a href="mailto:support@nydex.in" className="text-primary font-medium hover:underline inline-block">support@nydex.in</a>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  We aim to respond to all inquiries within 24 hours.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
