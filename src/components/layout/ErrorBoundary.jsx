import { Component } from 'react';
import Button from '../ui/Button';
import Container from '../ui/Container';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
          <Container size="sm">
            <div className="text-center py-16">
              <svg
                className="mx-auto text-coral mb-6"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h1 className="font-title text-4xl text-blue mb-4">Algo salió mal</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Lo sentimos, ocurrió un error inesperado. Probá recargar la página.
              </p>
              <Button onClick={this.handleRetry} variant="primary" size="lg">
                Recargar
              </Button>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-8 text-left text-sm text-gray-500">
                  <summary className="cursor-pointer mb-2">Detalles del error (desarrollo)</summary>
                  <pre className="bg-gray-100 p-4 rounded-xl overflow-auto max-h-64">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;