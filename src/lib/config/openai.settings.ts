/**
 * OpenAI Configuration Settings
 * 
 * This file contains the default configuration for OpenAI integration.
 * The API key should still be provided via .env file for security.
 * Other settings can be overridden via environment variables if needed.
 */

export const OPENAI_SETTINGS = {
  /**
   * Default model to use for generating test case titles
   * Options: 'gpt-4-turbo-preview' | 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'
   */
  model: 'gpt-4o-mini',

  /**
   * Maximum number of tokens to generate
   * Range: 1-4000
   * Default: 2000 (good for generating multiple test case titles)
   */
  maxTokens: 2000,

  /**
   * Temperature controls randomness in the output
   * Range: 0-1
   * - 0: focused and deterministic
   * - 0.7: balanced creativity (recommended)
   * - 1: maximum creativity
   */
  temperature: 0.7,
} as const;

// Type definitions for the settings
export type OpenAIModel = typeof OPENAI_SETTINGS.model;
export type OpenAISettings = typeof OPENAI_SETTINGS;

// Validation functions
export const isValidModel = (model: string): model is OpenAIModel => {
  return [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4o-mini'

  ].includes(model);
};

export const isValidMaxTokens = (tokens: number): boolean => {
  return tokens > 0 && tokens <= 4000;
};

export const isValidTemperature = (temp: number): boolean => {
  return temp >= 0 && temp <= 1;
};
