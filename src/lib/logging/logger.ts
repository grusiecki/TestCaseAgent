import type { APIContext } from 'astro';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  data?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
  duration?: number;
}

class Logger {
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString()
    });
  }

  info(event: string, data?: Record<string, unknown>) {
    const entry = this.formatLogEntry({
      timestamp: new Date().toISOString(),
      level: 'info',
      event,
      data
    });
    console.log(entry);
  }

  error(event: string, error: Error, data?: Record<string, unknown>) {
    const entry = this.formatLogEntry({
      timestamp: new Date().toISOString(),
      level: 'error',
      event,
      data: {
        ...data,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    });
    console.error(entry);
  }

  async logRequest(context: APIContext, handler: () => Promise<Response>): Promise<Response> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    const { request, locals } = context;

    try {
      // Log request start
      this.info('request_start', {
        requestId,
        method: request.method,
        url: request.url,
        userId: locals.user?.id
      });

      // Execute handler
      const response = await handler();
      const duration = Date.now() - startTime;

      // Log request completion
      this.info('request_complete', {
        requestId,
        method: request.method,
        url: request.url,
        status: response.status,
        duration,
        userId: locals.user?.id
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      this.error('request_error', error as Error, {
        requestId,
        method: request.method,
        url: request.url,
        duration,
        userId: locals.user?.id
      });

      throw error;
    }
  }
}

export const logger = new Logger();
