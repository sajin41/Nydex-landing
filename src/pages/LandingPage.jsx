import React from 'react';
import { HeroSection } from '../components/marketing/HeroSection';
import { ProductSection } from '../components/marketing/ProductSection';
import { HowItWorksSection } from '../components/marketing/HowItWorksSection';
import { TechnologySection } from '../components/marketing/TechnologySection';
import { PricingSection } from '../components/marketing/PricingSection';
import { CompanySection } from '../components/marketing/CompanySection';

export const LandingPage = () => {
  return (
    <div className="flex-1 w-full bg-background relative selection:bg-primary/30 selection:text-primary-foreground">
      <HeroSection />
      <ProductSection />
      <HowItWorksSection />
      <TechnologySection />
      <PricingSection />
      <CompanySection />
    </div>
  );
};
