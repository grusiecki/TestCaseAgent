import type { GenerateDetailsCommand, TestCaseDetailsDTO, GenerateTitlesCommand, TitlesDTO } from '@/types';

export class AIService {
  static async generateTitles(command: GenerateTitlesCommand): Promise<TitlesDTO> {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error('Failed to generate titles');
    }

    return response.json();
  }

  static async generateDetails(command: GenerateDetailsCommand): Promise<TestCaseDetailsDTO> {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate test case details' }));
      throw new Error(error.message || 'Failed to generate test case details');
    }

    return response.json();
  }
}