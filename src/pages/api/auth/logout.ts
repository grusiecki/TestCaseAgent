import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase sign out error:", error);
    }

    // Clear the auth cookie
    cookies.delete("session", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ error: "Failed to logout" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
