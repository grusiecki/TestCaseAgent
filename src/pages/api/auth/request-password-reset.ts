import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase.client";
import { z } from "zod";

const requestResetSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("Received password reset request for:", body.email);

    let validatedData;
    try {
      validatedData = requestResetSchema.parse(body);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "Validation failed",
            details: validationError.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw validationError;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${request.headers.get('origin')}/change-password`,
    });

    if (error) {
      console.error("Supabase reset password error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Always return success to avoid email enumeration attacks
    return new Response(JSON.stringify({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return new Response(JSON.stringify({ error: "Failed to process password reset request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
