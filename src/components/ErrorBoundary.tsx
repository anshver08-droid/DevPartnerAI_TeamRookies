import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React render:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-red-200 p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <TriangleAlert className="size-8" />
              <div>
                <h1 className="text-lg font-bold">DevPartner AI — Runtime Notice</h1>
                <p className="text-xs text-slate-500">An unexpected error occurred during rendering.</p>
              </div>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-mono text-red-800 mb-4 overflow-auto max-h-48">
              {this.state.error?.message || "Unknown error"}
              {this.state.error?.stack && (
                <pre className="mt-2 text-[10px] text-slate-600 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="size-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
