import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Dapatkan DSN dari environment variable
const SENTRY_DSN = process.env.VITE_SENTRY_DSN;

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  integrations: any[];
}

// Konfigurasi default untuk Sentry
const getDefaultConfig = (): SentryConfig => ({
  dsn: SENTRY_DSN || "",
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.1,
  integrations: [
    new BrowserTracing({
      // Konfigurasi tracing untuk performance monitoring
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/your-domain\.com\/api/,
      ],
    }),
  ],
});

// Inisialisasi Sentry
export function initSentry(customConfig?: Partial<SentryConfig>): void {
  // Jangan inisialisasi Sentry jika tidak ada DSN
  if (!SENTRY_DSN) {
    console.warn("SENTRY_DSN tidak ditemukan. Sentry tidak akan diinisialisasi.");
    return;
  }

  const defaultConfig = getDefaultConfig();
  const config: SentryConfig = {
    ...defaultConfig,
    ...customConfig,
  };

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate,
    integrations: config.integrations,
    // Konfigurasi tambahan untuk error reporting
    beforeSend: (event, hint) => {
      // Tambahkan metadata tambahan ke setiap error
      const error = hint.originalException;
      if (error && error instanceof Error) {
        // Tambahkan informasi tambahan jika tersedia
        event.tags = {
          ...event.tags,
          userAgent: navigator.userAgent,
          url: window.location.href,
        };
      }
      
      return event;
    },
  });

  console.log(`Sentry diinisialisasi untuk environment: ${config.environment}`);
}

// Fungsi untuk menambahkan user context ke Sentry
export function setUserContext(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Fungsi untuk membersihkan user context
export function clearUserContext(): void {
  Sentry.setUser(null);
}

// Fungsi untuk menambahkan context tambahan
export function setExtraContext(key: string, value: any): void {
  Sentry.setExtra(key, value);
}

// Fungsi untuk menambahkan tag
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

// Fungsi untuk menangkap error secara manual
export function captureError(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

// Fungsi untuk menangkap pesan
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  Sentry.captureMessage(message, level);
}

// Fungsi untuk menangkap error boundary
export function captureErrorBoundary(error: Error, componentStack?: string): void {
  Sentry.withScope((scope) => {
    if (componentStack) {
      scope.setExtra("componentStack", componentStack);
    }
    Sentry.captureException(error);
  });
}

export default {
  init: initSentry,
  setUser: setUserContext,
  clearUser: clearUserContext,
  setExtra: setExtraContext,
  setTag,
  captureError,
  captureMessage,
  captureErrorBoundary,
};