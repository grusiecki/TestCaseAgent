import type { APIContext } from "astro";
import { APIError } from "../lib/errors/api-errors";

const MAX_PAYLOAD_SIZE = 100 * 1024; // 100KB limit

export const checkPayloadSize = async (context: APIContext) => {
  const { request } = context;
  
  // Get content length from headers
  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  
  if (contentLength > MAX_PAYLOAD_SIZE) {
    throw new APIError(413, "Payload Too Large", {
      limit: MAX_PAYLOAD_SIZE,
      received: contentLength
    });
  }

  // For requests without content-length header, read and check the body
  if (request.body && !contentLength) {
    const body = await request.text();
    if (body.length > MAX_PAYLOAD_SIZE) {
      throw new APIError(413, "Payload Too Large", {
        limit: MAX_PAYLOAD_SIZE,
        received: body.length
      });
    }
    
    // Replace the consumed body with a new one
    context.request = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: body
    });
  }
};
