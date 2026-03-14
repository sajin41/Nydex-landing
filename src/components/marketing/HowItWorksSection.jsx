import React from 'react';
import { motion } from 'framer-motion';

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Upload your trading charts",
      description: "Drop your screenshot directly into our platform. No complex data feeds needed."
    },
    {
      number: "2",
      title: "AI analyzes market structure",
      description: "Our proprietary vision models detect liquidity pools, imbalances, and structural breaks."
    },
    {
      number: "3",
      title: "Combine data, news & indicators",
      description: "The engine cross-references the technical picture with real-time news and macro events."
    },
    {
      number: "4",
      title: "Get scenarios and probabilities",
      description: "Receive a detailed narrative outlining the most likely market scenarios and high-probability zones."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/50 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 md:max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            From raw chart to deep institutional logic in seconds.
          </motion.p>
        </div>

        <div className="relative">
          {/* Vertical line connecting steps on larger screens */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12 md:space-y-0 text-left">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative md:pl-20 md:pb-16"
              >
                {/* Number bullet */}
                <div className="md:absolute left-0 top-0 mb-4 md:mb-0 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-xl font-bold z-10 shadow-sm relative text-foreground">
                  {step.number}
                  {/* Active highlight inner ring */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.15 + 0.3, type: "spring" }}
                    className="absolute inset-1 rounded-full border-2 border-foreground/10 pointer-events-none"
                  />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground md:max-w-md text-lg">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
