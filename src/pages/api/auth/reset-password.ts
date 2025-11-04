import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase.client";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("Received password reset with token");

    let validatedData;
    try {
      validatedData = resetPasswordSchema.parse(body);
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

    // First, verify the token by attempting to create a session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: validatedData.token,
      type: 'recovery',
    });

    if (sessionError) {
      console.error("Token verification error:", sessionError);
      return new Response(JSON.stringify({ error: "Invalid or expired reset token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: "Failed to verify reset token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Now update the password using the session
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.password
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Password has been reset successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return new Response(JSON.stringify({ error: "Failed to reset password" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
