import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Tymczasowy log do debugowania
console.log('Debug env variables:');
console.log('SUPABASE_URL:', supabaseUrl ? 'jest zdefiniowany' : 'brak');
console.log('SUPABASE_KEY:', supabaseAnonKey ? 'jest zdefiniowany' : 'brak');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_KEY are set in your .env file."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
