import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../Button/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BuildTwin ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="surface-panel m-4 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto border border-status-danger/30 rounded-xl bg-red-50/10">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-status-danger mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-ink-900 mb-2">Something went wrong</h2>
          <p className="text-xs text-ink-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={this.handleReset}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Try Again
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.location.href = '/dashboard';
              }}
            >
              <Home className="h-4 w-4 mr-1.5" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
