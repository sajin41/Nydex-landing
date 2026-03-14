import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tight text-foreground inline-block mb-4">
              NYDEX
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              AI-powered market intelligence. Upload charts, analyze markets, and trade smarter with advanced reasoning.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#product" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Product</a></li>
              <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground text-sm transition-colors">How it works</a></li>
              <li><a href="#technology" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Technology</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact</a></li>
              <li><a href="https://ai.nydex.in" className="text-muted-foreground hover:text-foreground text-sm transition-colors">App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NYDEX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
