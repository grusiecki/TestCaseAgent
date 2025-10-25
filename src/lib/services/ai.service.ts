import type { GenerateTitlesCommand, TitlesDTO } from '@/types';

class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AIService {
  private static readonly GENERATE_TITLES_ENDPOINT = '/api/ai/generate-titles';

  static async generateTitles(command: GenerateTitlesCommand): Promise<TitlesDTO> {
    try {
      const response = await fetch(this.GENERATE_TITLES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIServiceError(
          errorData.message || 'Failed to generate test case titles. Please try again.'
        );
      }

      const data = await response.json();
      
      if (!data.titles || !Array.isArray(data.titles)) {
        throw new AIServiceError('Invalid response format from AI service');
      }

      return data as TitlesDTO;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new AIServiceError(
          `Error while generating titles: ${error.message}`
        );
      }

      throw new AIServiceError('An unexpected error occurred');
    }
  }
}
