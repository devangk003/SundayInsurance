// Console filter for development - suppress non-critical warnings
if (import.meta.env.DEV) {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  // Filter React Router future flag warnings
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('React Router Future Flag Warning')) {
      return; // Suppress React Router warnings
    }
    originalWarn.apply(console, args);
  };

  // Filter network errors from extensions
  console.error = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('google-analytics.com') ||
      message.includes('ERR_BLOCKED_BY_CLIENT') ||
      message.includes('Cache get failed') ||
      message.includes('Cache set failed')
    ) {
      return; // Suppress extension-related errors
    }
    originalError.apply(console, args);
  };
}

export {};
