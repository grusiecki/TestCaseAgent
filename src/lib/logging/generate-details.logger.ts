import { logger } from './logger';

type LogContext = {
  projectId?: string;
  testCaseId?: string;
  testCaseTitle?: string;
  error?: Error | unknown;
  currentIndex?: number;
  totalTestCases?: number;
  generationDuration?: number;
  status?: string;
};

class GenerateDetailsLogger {
  private addContext(context: LogContext = {}) {
    return {
      feature: 'generate-details',
      ...context
    };
  }

  info(event: string, context: LogContext = {}) {
    logger.info(event, this.addContext(context));
  }

  warn(event: string, context: LogContext = {}) {
    logger.warn(event, this.addContext(context));
  }

  error(event: string, context: LogContext = {}) {
    logger.error(event, this.addContext(context));
  }

  // Specific logging methods for common events
  generationStarted(context: LogContext) {
    this.info('generation-started', context);
  }

  generationCompleted(context: LogContext) {
    this.info('generation-completed', context);
  }

  generationError(context: LogContext) {
    this.error('generation-error', context);
  }

  navigationEvent(context: LogContext) {
    this.info('navigation', context);
  }

  autosaveEvent(context: LogContext) {
    this.info('autosave', context);
  }

  autosaveError(context: LogContext) {
    this.error('autosave-error', context);
  }

  manualEdit(context: LogContext) {
    this.info('manual-edit', context);
  }

  exportStarted(context: LogContext) {
    this.info('export-started', context);
  }

  exportCompleted(context: LogContext) {
    this.info('export-completed', context);
  }

  exportError(context: LogContext) {
    this.error('export-error', context);
  }
}

export const generateDetailsLogger = new GenerateDetailsLogger();
