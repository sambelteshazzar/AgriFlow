import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AgriFlow System Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight font-heading">System Malfunction</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm font-medium leading-relaxed">
              The AgriFlow operating system encountered an unexpected critical failure. Diagnostics have been logged.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-lg mb-8 text-left border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Error Trace</p>
                 <code className="text-xs font-mono text-red-600 dark:text-red-400 block break-words">
                   {this.state.error.message}
                 </code>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-5 h-5" /> Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}