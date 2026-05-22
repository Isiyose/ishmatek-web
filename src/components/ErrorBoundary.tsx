import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-bg-1 text-center transition-colors duration-200">
          <div className="w-16 h-16 bg-nexus-red/10 text-nexus-red rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Interface Error</h2>
          <p className="text-sm text-text-dim mb-8 max-w-xs">
            We encountered a rendering issue. Reloading may resolve this.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-nexus-blue text-white font-bold rounded-xl hover:bg-nexus-blue/90 transition-all shadow-lg"
          >
            <RefreshCw size={18} />
            Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
