# API Documentation

## POST /projects

Creates a new project with optional initial test cases.

### Authentication

- Requires a valid authentication token
- Token should be provided in the Authorization header

### Request

```typescript
{
  "name": string;          // Required: Project name (1-100 characters)
  "initialTitles"?: string[]; // Optional: Initial test case titles (max 20)
}
```

### Response

#### Success (201 Created)
```typescript
{
  "id": string;           // Project UUID
  "name": string;         // Project name
  "created_at": string;   // ISO timestamp
  "rating": number|null;  // Project rating (null for new projects)
  "testCaseCount": number; // Number of test cases
}
```

#### Error Responses

##### 400 Bad Request
```typescript
{
  "error": "ValidationError",
  "message": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "path": ["name"],
      "message": "Project name is required"
    }
  ]
}
```

##### 401 Unauthorized
```typescript
{
  "error": "AuthenticationError",
  "message": "Authentication required"
}
```

##### 429 Too Many Requests
```typescript
{
  "error": "APIError",
  "message": "Too Many Requests",
  "details": {
    "retryAfter": 300,
    "limit": 100,
    "windowMs": 900000
  }
}
```

##### 500 Internal Server Error
```typescript
{
  "error": "DatabaseError",
  "message": "Failed to create project"
}
```

### Rate Limiting

- 100 requests per 15-minute window per IP address
- Headers included in response:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Timestamp when the rate limit resets

### Example

```bash
# Request
curl -X POST https://api.example.com/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce Testing",
    "initialTitles": [
      "User Registration Flow",
      "Product Search",
      "Shopping Cart"
    ]
  }'

# Success Response
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "E-commerce Testing",
  "created_at": "2025-10-20T10:00:00Z",
  "rating": null,
  "testCaseCount": 3
}
```
