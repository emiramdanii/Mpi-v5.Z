'use client';
import React from 'react';

interface Props {
  children: React.ReactNode;
  panelName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PanelErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[PanelErrorBoundary${this.props.panelName ? ` - ${this.props.panelName}` : ''}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">
            Panel Error{this.props.panelName ? `: ${this.props.panelName}` : ''}
          </h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-md">
            {this.state.error?.message || 'Terjadi kesalahan pada panel ini.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
          >
            🔄 Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
