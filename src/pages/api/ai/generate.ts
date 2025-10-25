import type { APIRoute } from "astro";
import { z } from "zod";
import OpenAI from "openai";
import { openAIConfig } from "@/lib/config/openai.config";

const generateTitlesSchema = z.object({
  documentation: z.string()
    .min(100, "Documentation must be at least 100 characters long")
    .max(5000, "Documentation cannot exceed 5000 characters"),
  projectName: z.string().optional()
});

const SYSTEM_PROMPT = `You are a professional QA engineer tasked with creating test case titles based on provided documentation.
Your goal is to generate clear, concise, and descriptive test case titles that cover the main functionality and edge cases.

IMPORTANT: You must respond with a JSON object in the following exact format:
{
  "titles": string[]  // Array of test case title strings
}

Guidelines:
- Generate up to 20 test case titles maximum
- Each title should be clear and self-explanatory
- Focus on both happy path and edge cases
- Include validation test cases where relevant
- Consider error scenarios and boundary conditions
- Make titles specific but not too long
- Don't repeat similar test cases
- Don't include implementation details in titles

Example response format:
{
  "titles": [
    "Verify user login with valid credentials",
    "Attempt login with invalid password",
    "Check password reset functionality"
  ]
}`;

const USER_PROMPT_TEMPLATE = (documentation: string, projectName?: string) => {
  let context = "Based on the following documentation:";
  if (projectName) {
    context += ` (Project: ${projectName})`;
  }
  return `${context}

${documentation}

Generate appropriate test case titles following the guidelines. 
Remember to return the response in the exact JSON format specified:
{
  "titles": [
    "Title 1",
    "Title 2",
    ...
  ]
}`;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('API Debug:', {
      hasImportMeta: typeof import.meta !== 'undefined',
      hasEnv: typeof import.meta.env !== 'undefined',
      envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('OPENAI_')),
      mode: import.meta.env.MODE,
      hasOpenAIKey: !!import.meta.env.OPENAI_API_KEY
    });

    if (!import.meta.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured",
          debug: {
            mode: import.meta.env.MODE,
            availableKeys: Object.keys(import.meta.env).filter(key => !key.startsWith('_'))
          }
        }),
        { status: 500 }
      );
    }

    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', { 
      hasDocumentation: !!body.documentation,
      documentationLength: body.documentation?.length,
      hasProjectName: !!body.projectName 
    });

    console.log('Validating request data...');
    const { documentation, projectName } = generateTitlesSchema.parse(body);
    console.log('Data validated successfully');

    console.log('Initializing OpenAI...');
    const openai = new OpenAI({
      apiKey: import.meta.env.OPENAI_API_KEY
    });
    console.log('OpenAI initialized');

    console.log('Creating completion...');
    const completion = await openai.chat.completions.create({
      model: openAIConfig.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT_TEMPLATE(documentation, projectName) }
      ],
      temperature: openAIConfig.temperature,
      max_tokens: openAIConfig.maxTokens,
      response_format: { type: "json_object" }
    });

    console.log('OpenAI Response:', {
      model: completion.model,
      usage: completion.usage,
      finishReason: completion.choices[0]?.finish_reason,
      rawContent: completion.choices[0]?.message?.content
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('OpenAI Response Error: No content in response', {
        completion: completion
      });
      return new Response(
        JSON.stringify({ error: "No response from OpenAI" }),
        { status: 500 }
      );
    }

    console.log('Attempting to parse response content...');
    let response;
    try {
      response = JSON.parse(content);
      console.log('Parsed response:', response);
    } catch (error) {
      console.error('JSON Parse Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        content: content
      });
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse OpenAI response as JSON",
          debug: { content }
        }),
        { status: 500 }
      );
    }

    if (!Array.isArray(response.titles)) {
      console.error('Invalid Response Format:', {
        expectedFormat: '{ titles: string[] }',
        receivedResponse: response
      });
      return new Response(
        JSON.stringify({ 
          error: "Invalid response format from OpenAI",
          debug: { response }
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ titles: response.titles }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error generating titles:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error details:", {
      message: errorMessage,
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        debug: {
          errorType: error instanceof Error ? error.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined
        }
      }),
      { status: 500 }
    );
  }
};
