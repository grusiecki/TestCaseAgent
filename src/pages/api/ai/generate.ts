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

const generateDetailsSchema = z.object({
  title: z.string()
    .min(10, "Title must be at least 10 characters long")
    .max(200, "Title cannot exceed 200 characters"),
  context: z.string(),
  projectName: z.string(),
  documentation: z.string()
    .min(100, "Documentation must be at least 100 characters long")
    .max(5000, "Documentation cannot exceed 5000 characters"),
  testCaseIndex: z.number().int().min(0),
  totalTestCases: z.number().int().min(1),
  allTitles: z.array(z.string())
    .min(1, "At least one test case title is required")
    .max(50, "Maximum 50 test case titles allowed")
});

const TITLES_SYSTEM_PROMPT = `You are a professional QA engineer tasked with creating test case titles based on provided documentation.
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

const DETAILS_SYSTEM_PROMPT = `You are a professional QA engineer tasked with creating detailed test case specifications.
Your goal is to generate clear, structured, and comprehensive test case details that ensure thorough testing.

You will be generating test cases in sequence, where each test case may depend on or relate to previous test cases.
You must ensure that the test cases form a cohesive test suite where:
1. Test cases build upon each other when appropriate
2. Dependencies between test cases are clearly stated in preconditions
3. The sequence of test execution is logical and efficient
4. Each test case contributes to the overall testing coverage
5. Edge cases and error scenarios are distributed appropriately across the suite
6. Each step have to have a corresponding expected result
7. Do not number the steps, just describe them

IMPORTANT: You must respond with a JSON object in the following exact format:
{
  "preconditions": string,  // Required setup or initial conditions, including dependencies on previous test cases
  "steps": string,         // Step-by-step test procedure
  "expected_result": string // Expected outcome after test execution
}

Guidelines:
- Preconditions MUST:
  * List all required setup steps and initial conditions
  * Reference any previous test cases that need to be executed first
  * Specify the required state from previous test cases
- Steps MUST:
  * Be clear, and actionable
  
  
- Expected results MUST:
  * Be specific and verifiable
  * Consider the cumulative state of the system
  

Example response format:
{
  "preconditions": " User is logged out \\ User is on the login page",
  "steps": "Write correct user name\\ Write correct password \\ Submit login",
  "expected_result": " User name is written\\ Password is written\\ User is logged in. Main screen is visible"
}`;

const TITLES_USER_PROMPT = (documentation: string, projectName?: string) => {
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

const DETAILS_USER_PROMPT = (title: string, context: string, projectName: string, documentation: string, testCaseIndex: number, totalTestCases: number, allTitles: string[]) => {
  // Format previous test cases (completed)
  const previousTestCases = allTitles
    .slice(0, testCaseIndex)
    .map((t, i) => `#${i + 1}: ${t}`)
    .join('\n');

  // Format current test case
  const currentTestCase = `#${testCaseIndex + 1}: ${title} (CURRENT)`;

  // Format remaining test cases (upcoming)
  const remainingTestCases = allTitles
    .slice(testCaseIndex + 1)
    .map((t, i) => `#${testCaseIndex + 2 + i}: ${t}`)
    .join('\n');

  return `Generate detailed test case specification for test case #${testCaseIndex + 1} of ${totalTestCases}.

Project: ${projectName}

Test Case Execution Sequence:


Context: ${context}

Project Documentation:
${documentation}

IMPORTANT INSTRUCTIONS:

1. You MUST maintain a logical testing flow 
2. You MUST provide logical expected result for EACH step



Generate appropriate test case details following the guidelines.
Remember to return the response in the exact JSON format specified:
{
  "preconditions": "User is logged out \\ User is on the login page",
  "steps": "First step\\ Second step",
  "expected_result": "First expected result\\State is prepared for test case #4"
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
    // Determine request type based on body content
    const isDetailsRequest = 'title' in body;
    
    const validatedData = isDetailsRequest 
      ? generateDetailsSchema.parse(body)
      : generateTitlesSchema.parse(body);
    console.log('Data validated successfully', { isDetailsRequest });

    console.log('Initializing OpenAI...');
    const openai = new OpenAI({
      apiKey: import.meta.env.OPENAI_API_KEY
    });
    console.log('OpenAI initialized');

    console.log('Creating completion...');
    const completion = await openai.chat.completions.create({
      model: openAIConfig.model,
      messages: isDetailsRequest ? [
        { role: "system", content: DETAILS_SYSTEM_PROMPT },
        { role: "user", content: DETAILS_USER_PROMPT(
          (validatedData as z.infer<typeof generateDetailsSchema>).title,
          (validatedData as z.infer<typeof generateDetailsSchema>).context,
          (validatedData as z.infer<typeof generateDetailsSchema>).projectName,
          (validatedData as z.infer<typeof generateDetailsSchema>).documentation,
          (validatedData as z.infer<typeof generateDetailsSchema>).testCaseIndex,
          (validatedData as z.infer<typeof generateDetailsSchema>).totalTestCases,
          (validatedData as z.infer<typeof generateDetailsSchema>).allTitles
        ) }
      ] : [
        { role: "system", content: TITLES_SYSTEM_PROMPT },
        { role: "user", content: TITLES_USER_PROMPT(
          (validatedData as z.infer<typeof generateTitlesSchema>).documentation,
          (validatedData as z.infer<typeof generateTitlesSchema>).projectName
        ) }
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

    if (isDetailsRequest) {
      // Validate details response format
      if (!response.preconditions || !response.steps || !response.expected_result) {
        console.error('Invalid Details Response Format:', {
          expectedFormat: '{ preconditions: string, steps: string, expected_result: string }',
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
        JSON.stringify({
          preconditions: response.preconditions,
          steps: response.steps,
          expected_result: response.expected_result
        }),
        { status: 200 }
      );
    } else {
      // Validate titles response format
      if (!Array.isArray(response.titles)) {
        console.error('Invalid Titles Response Format:', {
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
    }

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
