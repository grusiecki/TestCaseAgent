import { useState, useEffect } from 'react';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface ValidationState {
  errorMessage: string | null;
  isValid: boolean;
}

interface ValidationRules {
  minTitles: number;
  maxTitles: number;
  minTitleLength: number;
}

const DEFAULT_RULES: ValidationRules = {
  minTitles: 1,
  maxTitles: 20,
  minTitleLength: 3
};

export const useTitlesValidation = (
  titles: string[],
  rules: ValidationRules = DEFAULT_RULES
) => {
  const [validation, setValidation] = useState<ValidationState>({
    errorMessage: null,
    isValid: true
  });

  useEffect(() => {
    try {
      // Check minimum number of titles
      if (titles.length < rules.minTitles) {
        setValidation({
          errorMessage: 'At least one title is required',
          isValid: false
        });
        return;
      }

      // Check maximum number of titles
      if (titles.length > rules.maxTitles) {
        setValidation({
          errorMessage: `Maximum ${rules.maxTitles} titles allowed`,
          isValid: false
        });
        return;
      }

      // Check for empty or too short titles
      const invalidTitle = titles.find(
        title => !title.trim() || title.trim().length < rules.minTitleLength
      );
      if (invalidTitle !== undefined) {
        setValidation({
          errorMessage: `Titles must be at least ${rules.minTitleLength} characters long`,
          isValid: false
        });
        return;
      }

      // Check for duplicate titles
      const uniqueTitles = new Set(titles.map(t => t.trim()));
      if (uniqueTitles.size !== titles.length) {
        setValidation({
          errorMessage: 'Duplicate titles are not allowed',
          isValid: false
        });
        return;
      }

      // All validations passed
      setValidation({
        errorMessage: null,
        isValid: true
      });
    } catch (error) {
      newProjectLogger.error('titles-validation-error', { error });
      setValidation({
        errorMessage: 'An error occurred while validating titles',
        isValid: false
      });
    }
  }, [titles, rules]);

  return validation;
};
