import type { TitlesDTO } from '@/types';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

/**
 * Error class for titles-related operations
 */
class TitlesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TitlesServiceError';
  }
}

/**
 * Service for managing test case titles
 * Handles saving and retrieving titles from both local storage and the backend
 */
export class TitlesService {
  private static readonly STORAGE_KEY = 'generatedTitles';
  private static readonly UPDATE_TITLES_ENDPOINT = '/api/projects/titles';

  /**
   * Saves titles to both localStorage and the backend
   * @param titles Array of test case titles to save
   * @param projectId Optional project ID to associate titles with
   * @throws {TitlesServiceError} If saving fails
   */
  static async saveTitles(titles: string[], projectId?: string): Promise<void> {
    try {
      // Save to localStorage first for immediate feedback
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(titles));

      // If we have a project ID, also save to the backend
      if (projectId) {
        const response = await fetch(`${this.UPDATE_TITLES_ENDPOINT}/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ titles }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new TitlesServiceError(
            errorData.message || 'Failed to save titles to the server'
          );
        }
      }

      newProjectLogger.info('titles-saved', {
        count: titles.length,
        projectId,
      });
    } catch (error) {
      newProjectLogger.error('save-titles-error', { error, projectId });
      
      if (error instanceof TitlesServiceError) {
        throw error;
      }
      
      throw new TitlesServiceError(
        error instanceof Error ? error.message : 'Failed to save titles'
      );
    }
  }

  /**
   * Loads titles from localStorage
   * @returns Array of saved titles or null if none found
   * @throws {TitlesServiceError} If loading fails
   */
  static loadTitles(): string[] | null {
    try {
      const savedTitles = localStorage.getItem(this.STORAGE_KEY);
      if (!savedTitles) {
        return null;
      }

      const titles = JSON.parse(savedTitles);
      if (!Array.isArray(titles)) {
        throw new TitlesServiceError('Invalid titles format in storage');
      }

      return titles;
    } catch (error) {
      newProjectLogger.error('load-titles-error', { error });
      throw new TitlesServiceError(
        'Failed to load saved titles. Please try again.'
      );
    }
  }

  /**
   * Clears saved titles from localStorage
   */
  static clearSavedTitles(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      newProjectLogger.error('clear-titles-error', { error });
    }
  }
}
