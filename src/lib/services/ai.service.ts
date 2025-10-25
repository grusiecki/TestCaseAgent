import type { GenerateTitlesCommand, TitlesDTO } from '@/types';

const SYSTEM_PROMPT = `You are a professional QA engineer tasked with creating test case titles based on provided documentation.
Your goal is to generate clear, concise, and descriptive test case titles that cover the main functionality and edge cases.

Guidelines:
- Generate up to 20 test case titles maximum
- Each title should be clear and self-explanatory
- Focus on both happy path and edge cases
- Include validation test cases where relevant
- Consider error scenarios and boundary conditions
- Make titles specific but not too long
- Don't repeat similar test cases
- Don't include implementation details in titles`;

const USER_PROMPT_TEMPLATE = (documentation: string, projectName?: string) => {
  let context = "Based on the following documentation:";
  if (projectName) {
    context += ` (Project: ${projectName})`;
  }
  return `${context}

${documentation}

Generate appropriate test case titles following the guidelines. Return them as a JSON array of strings.`;
};

class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'INVALID_FORMAT' | 'API_ERROR' = 'API_ERROR',
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AIService {
  private static readonly GENERATE_ENDPOINT = '/api/ai/generate';

  static async generateTitles(command: GenerateTitlesCommand): Promise<TitlesDTO> {
    try {
      const response = await fetch(this.GENERATE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
      }).catch(error => {
        throw new AIServiceError(
          `Network error while calling AI service: ${error.message}`,
          'NETWORK_ERROR',
          error
        );
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new AIServiceError(
          errorData.error || 'Failed to generate titles',
          'API_ERROR',
          errorData
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new AIServiceError(
          'Failed to parse server response as JSON',
          'PARSE_ERROR',
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseText: await response.text().catch(() => 'Failed to get response text')
          }
        );
      }

      if (!data || typeof data !== 'object') {
        throw new AIServiceError(
          'Invalid response format: expected JSON object',
          'INVALID_FORMAT',
          { received: data }
        );
      }

      if (!Array.isArray(data.titles)) {
        throw new AIServiceError(
          'Invalid response format: missing titles array',
          'INVALID_FORMAT',
          { 
            expected: '{ titles: string[] }',
            received: data 
          }
        );
      }

      if (!data.titles.every((title: unknown) => typeof title === 'string')) {
        throw new AIServiceError(
          'Invalid response format: titles must be strings',
          'INVALID_FORMAT',
          { titles: data.titles }
        );
      }

      return { titles: data.titles };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      throw new AIServiceError(
        'An unexpected error occurred',
        'API_ERROR',
        error instanceof Error ? { 
          message: error.message,
          stack: error.stack 
        } : error
      );
    }
  }
}
