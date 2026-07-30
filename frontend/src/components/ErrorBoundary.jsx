import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Kasandigan Client Render Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                Kasandigan • LGU Maramag System Notice
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Application Display Error
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected display issue occurred in this section. Your data and account records are secure in the database.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left overflow-x-auto text-[11px] font-mono text-rose-700 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
