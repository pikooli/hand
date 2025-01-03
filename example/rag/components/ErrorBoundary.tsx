'use client';
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can use your own error logging service here
    console.log({ error, errorInfo });
  }

  render(): ReactNode {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-black flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-white mb-8">Oops, something went wrong! 🤔</h2>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-3 text-lg font-semibold text-black bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Return children components in case of no error
    return this.props.children;
  }
}

export default ErrorBoundary;
