import React from 'react';
import LogoutButton from '@/components/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-surface pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bebas text-blood-red">8CTRL // ADMIN PANEL</h1>
            <p className="text-text-secondary mt-2">Manage website content and themes.</p>
          </div>
          <div className="pb-1">
            <LogoutButton />
          </div>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
