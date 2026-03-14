import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const MarketingLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden pt-12">
      {/* Promo Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium tracking-wide">
        <span className="hidden sm:inline">NEW — 20% discount on your first purchase.</span>
        <span className="sm:hidden">20% off your first purchase.</span>
        <span className="ml-2 font-bold bg-white/20 px-2 py-0.5 rounded text-xs select-all">NYDEX20</span>
      </div>
      
      <Header />
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
};
