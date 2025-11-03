import { logger } from './logger';

const LOG_NAMESPACE = 'csv-export';

const getComponentState = () => ({
  windowLocation: {
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  },
  timestamp: new Date().toISOString(),
  documentReady: document.readyState,
  viewportSize: {
    width: window.innerWidth,
    height: window.innerHeight
  }
});

export const csvExportLogger = {
  componentLifecycle: (phase: 'mount' | 'unmount' | 'render' | 'error', details?: Record<string, unknown>) => {
    logger.info(`[${LOG_NAMESPACE}:lifecycle] Component ${phase}`, {
      ...getComponentState(),
      ...details
    });
  },

  exportAction: (action: 'start' | 'success' | 'error' | 'cancel', data: Record<string, unknown>) => {
    const level = action === 'error' ? 'error' : 'info';
    logger[level](`[${LOG_NAMESPACE}:export] ${action}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  apiCall: (action: 'start' | 'success' | 'error', data: Record<string, unknown>) => {
    const level = action === 'error' ? 'error' : 'info';
    logger[level](`[${LOG_NAMESPACE}:api] ${action}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  userInteraction: (action: string, data: Record<string, unknown>) => {
    logger.debug(`[${LOG_NAMESPACE}:interaction] ${action}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  validationError: (field: string, value: unknown, error: string) => {
    logger.warn(`[${LOG_NAMESPACE}:validation] Field validation failed`, {
      field,
      value,
      error,
      timestamp: new Date().toISOString(),
    });
  }
};
