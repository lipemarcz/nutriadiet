import React from 'react';
import { MessageCircle } from 'lucide-react';

interface AppShellProps {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ header, sidebar, children, footer }) => {
  return (
    <div className="min-h-screen bg-app text-foreground">
      {header}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <main className={sidebar ? 'lg:col-span-8' : 'lg:col-span-12'}>{children}</main>
          {sidebar && <aside className="lg:col-span-4">{sidebar}</aside>}
        </div>
      </div>
      {footer && (
        <footer className="mt-8 border-t border-border">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted">
            {footer}
          </div>
        </footer>
      )}

      {/* Global Floating Suggestion Button */}
      <a
        href="https://x.com/asiaticonutri"
        target="_blank"
        rel="noreferrer noopener"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/60"
        aria-label="Abrir sugestões no X"
      >
        <div className="relative group">
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
          <span className="pointer-events-none absolute -top-10 right-1/2 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Sugestões?
          </span>
        </div>
      </a>
    </div>
  );
};

export default AppShell;
