'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback redirect
      window.location.href = '/admin/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 border border-blood-red/30 hover:border-blood-red hover:bg-blood-red/10 rounded text-xs font-mono uppercase text-text-secondary hover:text-white transition-all cursor-pointer disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      {loading ? 'LOGGING OUT...' : 'LOG OUT'}
    </button>
  );
}
