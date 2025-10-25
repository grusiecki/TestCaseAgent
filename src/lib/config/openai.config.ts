import { OPENAI_SETTINGS, isValidModel, isValidMaxTokens, isValidTemperature } from './openai.settings';

import { logger } from '../logging/logger';

// Configuration with environment variable overrides
export const openAIConfig = {
  model: (import.meta.env.OPENAI_MODEL && isValidModel(import.meta.env.OPENAI_MODEL))
    ? import.meta.env.OPENAI_MODEL
    : OPENAI_SETTINGS.model,

  maxTokens: (import.meta.env.OPENAI_MAX_TOKENS && !isNaN(Number(import.meta.env.OPENAI_MAX_TOKENS)) && isValidMaxTokens(Number(import.meta.env.OPENAI_MAX_TOKENS)))
    ? Number(import.meta.env.OPENAI_MAX_TOKENS)
    : OPENAI_SETTINGS.maxTokens,

  temperature: (import.meta.env.OPENAI_TEMPERATURE && !isNaN(Number(import.meta.env.OPENAI_TEMPERATURE)) && isValidTemperature(Number(import.meta.env.OPENAI_TEMPERATURE)))
    ? Number(import.meta.env.OPENAI_TEMPERATURE)
    : OPENAI_SETTINGS.temperature,
} as const;

// Log the actual configuration being used
logger.debug('OpenAI Config Values', {
  configuredModel: openAIConfig.model,
  configuredMaxTokens: openAIConfig.maxTokens,
  configuredTemperature: openAIConfig.temperature
});

// Helper function to validate API key when needed
export const validateApiKey = () => {
  if (!import.meta.env.OPENAI_API_KEY) {
    logger.error('OpenAI API Key Missing', {
      error: 'OPENAI_API_KEY environment variable is required',
      envState: {
        mode: import.meta.env.MODE
      }
    });
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return import.meta.env.OPENAI_API_KEY;
};