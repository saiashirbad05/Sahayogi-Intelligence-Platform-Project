import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          margin: '20px', 
          borderRadius: '16px', 
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: '#EF4444', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ margin: 0, color: '#1E293B' }}>Something went wrong</h2>
          <p style={{ color: '#64748B', maxWidth: '400px', fontSize: '14px' }}>
            A component has crashed due to an unhandled error. Our intelligence hub has been notified.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              background: '#1E293B', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <RefreshCcw size={16} /> Reload Platform
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ 
              textAlign: 'left', 
              width: '100%', 
              overflow: 'auto', 
              fontSize: '10px', 
              padding: '16px', 
              background: '#F8FAFC', 
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginTop: '16px'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
