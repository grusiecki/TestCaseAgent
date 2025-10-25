import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase.client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"), // Allow test123
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    console.log("Received login data:", { email: body.email, passwordLength: body.password?.length }); // Debug log

    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
    } catch (validationError) {
      console.error("Validation error:", validationError); // Debug log
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!data.session) {
      return new Response(JSON.stringify({ error: "No session created" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Set auth cookie
    cookies.set("session", data.session.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Invalid login data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
