'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X, RotateCcw } from 'lucide-react';

export interface AppError {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  source: 'database' | 'audio' | 'cursor' | 'cms' | 'api' | 'general';
  message: string;
  recovery?: string;
  diagnostics?: string;
  retry?: () => void;
  timestamp: Date;
}

interface ErrorContextType {
  errors: AppError[];
  reportError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  // Auto-dismiss info and warning logs after 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setErrors((prev) =>
        prev.filter((err) => {
          if (err.severity === 'info' || err.severity === 'warning') {
            const ageSec = (new Date().getTime() - err.timestamp.getTime()) / 1000;
            return ageSec < 8;
          }
          return true; // Keep errors and fatal errors until dismissed
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const reportError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newError: AppError = {
      ...error,
      id,
      timestamp: new Date(),
    };

    setErrors((prev) => {
      // Avoid duplicate errors from the same source with same message
      if (prev.some((e) => e.source === error.source && e.message === error.message)) {
        return prev;
      }
      return [...prev, newError];
    });

    console.error(`[Error Layer] [${error.severity.toUpperCase()}] [Source: ${error.source}] ${error.message}`, {
      recovery: error.recovery,
      diagnostics: error.diagnostics,
    });

    return id;
  };

  const clearError = (id: string) => {
    setErrors((prev) => prev.filter((err) => err.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, reportError, clearError, clearAllErrors }}>
      {children}

      {/* Floating Global Error Alert UI Banner */}
      {errors.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {errors.map((err) => {
            const isFatal = err.severity === 'fatal';
            const isError = err.severity === 'error';
            const isWarning = err.severity === 'warning';
            
            const iconMap = {
              info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
              error: <AlertTriangle className="w-5 h-5 text-crimson flex-shrink-0" />,
              fatal: <AlertCircle className="w-5 h-5 text-blood-red flex-shrink-0 animate-pulse" />,
            };

            return (
              <div
                key={err.id}
                className={`pointer-events-auto w-full p-4 rounded-md border flex gap-3 backdrop-blur-md transition-all duration-500 shadow-xl ${
                  isFatal
                    ? 'bg-[#150505]/95 border-blood-red/80 shadow-blood-red/10'
                    : isError
                    ? 'bg-[#0f0505]/95 border-crimson/50'
                    : isWarning
                    ? 'bg-[#0d0905]/95 border-amber-500/30'
                    : 'bg-[#050505]/95 border-white/10'
                }`}
              >
                {iconMap[err.severity]}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">
                      Subsystem: {err.source}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm uppercase ${
                      isFatal ? 'bg-blood-red text-white' : isError ? 'bg-crimson/20 text-crimson' : 'text-text-secondary border border-white/5'
                    }`}>
                      {err.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-foreground font-sans font-medium leading-relaxed break-words">
                    {err.message}
                  </p>
                  
                  {err.recovery && (
                    <p className="text-[10px] text-text-secondary font-sans mt-1.5 leading-snug">
                      <span className="text-[#a0a0a0] font-semibold">Tip:</span> {err.recovery}
                    </p>
                  )}
                  
                  {err.retry && (
                    <button
                      onClick={() => {
                        err.retry?.();
                        clearError(err.id);
                      }}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono uppercase tracking-wider transition-colors border border-white/5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-crimson" /> Retry Connection
                    </button>
                  )}
                </div>

                <button
                  onClick={() => clearError(err.id)}
                  className="text-text-secondary hover:text-white flex-shrink-0 self-start p-0.5 rounded hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useErrors = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrors must be used within an ErrorProvider');
  }
  return context;
};
