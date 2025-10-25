import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase.client";

export const GET: APIRoute = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  return new Response(
    JSON.stringify({
      authenticated: !!session,
      user: session?.user || null
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};