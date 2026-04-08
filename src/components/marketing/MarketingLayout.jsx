import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Crown, MessageSquare } from 'lucide-react';

export const MarketingLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden relative">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <Footer />

      {/* Floating Chatbot Widget (Demo) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 transform origin-bottom-right">
          <div className="flex items-center gap-3 mb-3 border-b border-border/50 pb-3">
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary-foreground" />
             </div>
             <div>
               <h4 className="text-sm font-bold">NYDEX Assistant</h4>
               <p className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span> Online</p>
             </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Need help configuring your ICT parameters? Need support with upgrading your plan? Ask me anything.
          </p>
          <div className="mt-4 relative">
             <input type="text" placeholder="Type a message..." className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 transition-colors" disabled />
             <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground italic opacity-50">Demo</div>
          </div>
        </div>

        <button className="w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 animate-ping opacity-20 rounded-full"></div>
          <MessageSquare className="w-6 h-6 z-10 relative" />
        </button>
      </div>

    </div>
  );
};
