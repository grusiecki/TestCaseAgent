// Custom error classes for better error handling
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class DatabaseError extends APIError {
  constructor(message: string, details?: unknown) {
    super(500, message, details);
    this.name = 'DatabaseError';
  }
}

// Error response formatter
export const formatErrorResponse = (error: Error): Response => {
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({
        error: error.name,
        message: error.message,
        details: error.details
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Handle OpenAI API errors
  if (error.name === 'OpenAIError' || error.message.includes('OpenAI')) {
    return new Response(
      JSON.stringify({
        error: 'OpenAIError',
        message: error.message,
        details: {
          cause: error.cause,
          stack: error.stack
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Default error response for unhandled errors
  console.error('Unhandled error:', error);
  return new Response(
    JSON.stringify({
      error: 'InternalServerError',
      message: error.message || 'An unexpected error occurred',
      details: {
        name: error.name,
        stack: error.stack
      }
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
