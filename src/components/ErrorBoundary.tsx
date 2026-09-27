import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mausam Uncaught Render Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Restoring Observatory Feed</h2>
            <p className="text-sm text-white/70 mb-6">
              A temporary display anomaly was prevented. Click below to refresh telemetry and restore live conditions.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Mausam Observatory</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
