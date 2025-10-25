import { logger } from './logger';

const LOG_NAMESPACE = 'new-project';

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

export const newProjectLogger = {
  componentLifecycle: (phase: 'mount' | 'unmount' | 'render' | 'error', details?: Record<string, unknown>) => {
    logger.info(`[${LOG_NAMESPACE}:lifecycle] Component ${phase}`, {
      ...getComponentState(),
      ...details
    });
  },
  formInteraction: (action: string, data: Record<string, unknown>) => {
    console.log(`[${LOG_NAMESPACE}:form] ${action}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    logger.debug(`[${LOG_NAMESPACE}:form] ${action}`, {
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
  },

  aiServiceCall: (action: 'start' | 'success' | 'error', data: Record<string, unknown>) => {
    const level = action === 'error' ? 'error' : 'info';
    logger[level](`[${LOG_NAMESPACE}:ai-service] ${action}`, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  navigationEvent: (destination: string, params: Record<string, unknown>) => {
    logger.info(`[${LOG_NAMESPACE}:navigation] Navigating to ${destination}`, {
      destination,
      currentPath: window.location.pathname,
      params,
      timestamp: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
    });
  },

  routeDebug: () => {
    logger.debug(`[${LOG_NAMESPACE}:route] Route debug info`, {
      pathname: window.location.pathname,
      search: window.location.search,
      href: window.location.href,
      timestamp: new Date().toISOString(),
    });
  },
};
