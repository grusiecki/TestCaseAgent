import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase.client";

const TEMP_EMAIL = "test@example.com";
const TEMP_PASSWORD = "test123";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    
    // Check if credentials match our temporary ones
    if (body.email === TEMP_EMAIL && body.password === TEMP_PASSWORD) {
      // Create a temporary session token
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEMP_EMAIL,
        password: TEMP_PASSWORD,
      });

      if (error) {
        // If Supabase auth fails, create a mock session
        const mockToken = "temp_session_" + Date.now();
        cookies.set("session", mockToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 1 day
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // If Supabase auth succeeds, use the real session
      if (data.session) {
        cookies.set("session", data.session.access_token, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 1 day
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Temp login error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

