import { OPENAI_SETTINGS, isValidModel, isValidMaxTokens, isValidTemperature } from './openai.settings';

// Configuration with environment variable overrides
export const openAIConfig = {
  model: process.env.OPENAI_MODEL && isValidModel(process.env.OPENAI_MODEL)
    ? process.env.OPENAI_MODEL
    : OPENAI_SETTINGS.model,

  maxTokens: process.env.OPENAI_MAX_TOKENS && isValidMaxTokens(Number(process.env.OPENAI_MAX_TOKENS))
    ? Number(process.env.OPENAI_MAX_TOKENS)
    : OPENAI_SETTINGS.maxTokens,

  temperature: process.env.OPENAI_TEMPERATURE && isValidTemperature(Number(process.env.OPENAI_TEMPERATURE))
    ? Number(process.env.OPENAI_TEMPERATURE)
    : OPENAI_SETTINGS.temperature,
} as const;

// Validate that OPENAI_API_KEY is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}