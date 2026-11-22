import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let cleanMessage = 'حدث خطأ غير متوقع أثناء تشغيل المنصة.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string };
      if (parsed && typeof parsed.error === 'string') {
        cleanMessage = 'تعذّر إتمام عملية المزامنة مع قاعدة البيانات. يرجى المحاولة مرة أخرى.';
      }
    } catch {
      if (error.message) {
        cleanMessage = error.message;
      }
    }
    return { hasError: true, message: cleanMessage };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">
              نعتذر عن هذا الخلل المؤقت
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  try {
                    if ('caches' in window) {
                      const keys = await window.caches.keys();
                      await Promise.all(keys.map((k) => window.caches.delete(k)));
                    }
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      await Promise.all(regs.map((r) => r.unregister()));
                    }
                  } catch {
                    // ignore cleanup failures
                  }
                  window.location.reload();
                })();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              إعادة تحميل المنصة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
