/**
 * OpenAI Configuration Settings
 * 
 * This file contains the default configuration for OpenAI integration.
 * The API key should still be provided via .env file for security.
 * Other settings can be overridden via environment variables if needed.
 */

export const OPENAI_SETTINGS = {
  /**
   * Settings for generating test case titles
   */
  titles: {
    /**
     * Model for generating test case titles
     * Using GPT-3.5-turbo for faster response and cost efficiency
     * as title generation is more straightforward
     */
    model: 'gpt-3.5-turbo',

    /**
     * Maximum tokens for title generation
     * Higher limit as we're generating multiple titles at once
     */
    maxTokens: 2000,

    /**
     * Temperature for title generation
     * Slightly higher temperature (0.4) to encourage diverse test case scenarios
     * while maintaining consistency
     */
    temperature: 0.2,
  },

  /**
   * Settings for generating test case details
   */
  details: {
    /**
     * Model for generating test case details
     * Using GPT-4 for more detailed and accurate test case generation
     * as it requires better understanding of context and edge cases
     */
    model: 'gpt-3.5-turbo',

    /**
     * Maximum tokens for details generation
     * Lower limit as we're generating one test case at a time
     */
    maxTokens: 1000,

    /**
     * Temperature for details generation
     * Lower temperature (0.2) for more focused and precise output
     * as we need consistent, well-structured test case details
     */
    temperature: 0.2,
  }
} as const;

// Type definitions for the settings
export type OpenAIModel = typeof OPENAI_SETTINGS.titles.model | typeof OPENAI_SETTINGS.details.model;
export type OpenAISettings = typeof OPENAI_SETTINGS;

export type OpenAIFeatureSettings = {
  model: OpenAIModel;
  maxTokens: number;
  temperature: number;
};

// Validation functions
export const isValidModel = (model: string): model is OpenAIModel => {
  return [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
  ].includes(model);
};

export const isValidMaxTokens = (tokens: number): boolean => {
  return tokens > 0 && tokens <= 4000;
};

export const isValidTemperature = (temp: number): boolean => {
  return temp >= 0 && temp <= 1;
};

export const getSettingsForTitles = (): OpenAIFeatureSettings => {
  return OPENAI_SETTINGS.titles;
};

export const getSettingsForDetails = (): OpenAIFeatureSettings => {
  return OPENAI_SETTINGS.details;
};
