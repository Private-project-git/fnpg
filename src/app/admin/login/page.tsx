'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid username or password.');
      }

      // Success: redirect to admin panel
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] text-[#F5F5F5] overflow-hidden px-4">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="noise-overlay" style={{ '--noise-opacity': '0.05' } as React.CSSProperties} />
      <div className="vignette" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0E0E0E]/80 backdrop-blur-xl border border-white/5 rounded-lg p-8 shadow-2xl shadow-black/80 relative overflow-hidden group">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blood-red to-transparent" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bebas text-blood-red tracking-wider transition-colors duration-300 group-hover:text-highlight-red">
              8CTRL // CONTROL
            </h1>
            <p className="text-text-secondary text-sm mt-2 font-mono uppercase tracking-widest">
              SYSTEM PORTAL ACCESS
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-blood-red/10 border border-blood-red/30 rounded flex items-start gap-3 animate-fade-in">
              <ShieldAlert className="w-5 h-5 text-highlight-red shrink-0 mt-0.5" />
              <span className="text-sm text-highlight-red font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-secondary font-mono mb-2">
                SYSTEM IDENTIFIER
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/20">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  className="w-full bg-[#181818]/60 border border-white/5 focus:border-blood-red/50 focus:ring-1 focus:ring-blood-red/30 rounded pl-10 pr-4 py-3 text-sm transition-all outline-none font-mono tracking-wide placeholder-white/20"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-secondary font-mono mb-2">
                SECURITY CRITERION
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/20">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full bg-[#181818]/60 border border-white/5 focus:border-blood-red/50 focus:ring-1 focus:ring-blood-red/30 rounded pl-10 pr-4 py-3 text-sm transition-all outline-none font-mono tracking-wide placeholder-white/20"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-blood-red text-white py-3.5 px-4 rounded font-mono uppercase text-sm tracking-widest hover:bg-crimson active:bg-blood-red disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 group/btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  INITIALIZE SESSION
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs uppercase tracking-widest text-text-secondary hover:text-highlight-red font-mono transition-colors"
          >
            ← BACK TO TERMINAL
          </a>
        </div>
      </div>
    </div>
  );
}
