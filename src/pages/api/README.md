# API Documentation

## AI Integration Endpoints

### Generate Test Case Titles

Endpoint: `POST /api/ai/generate-titles`

This endpoint uses OpenAI's API to generate test case titles based on provided documentation.

#### Request Body
```typescript
{
  documentation: string;    // Required: 100-5000 characters
  projectName?: string;    // Optional: Project name for context
}
```

#### Response
```typescript
{
  titles: string[];    // Array of generated test case titles
}
```

#### Error Responses
- `400 Bad Request`: Documentation length invalid or missing required fields
- `500 Internal Server Error`: OpenAI API error or other server-side issues

## Environment Variables

The following environment variables need to be set in your `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview    # or another compatible model
OPENAI_MAX_TOKENS=2000              # adjust based on your needs
OPENAI_TEMPERATURE=0.7              # adjust for creativity vs determinism
```

## Rate Limiting

The AI endpoints are subject to rate limiting:
- 10 requests per minute per IP
- 100 requests per day per IP

## Error Handling

The service implements proper error handling for:
- Invalid input validation
- OpenAI API failures
- Rate limiting
- Token quota exceeded