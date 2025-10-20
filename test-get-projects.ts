import { createClient } from "@supabase/supabase-js";
import type { Database } from "./src/db/database.types";
import * as dotenv from "dotenv";

// Załaduj zmienne środowiskowe z .env
dotenv.config();

// Sprawdź czy zmienne są dostępne
console.log("Environment variables loaded:", {
  SUPABASE_URL: process.env.SUPABASE_URL ? "✓" : "✗",
  SUPABASE_KEY: process.env.SUPABASE_KEY ? "✓" : "✗",
});

// Inicjalizacja klienta Supabase
const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
  db: {
    schema: "public",
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testGetProjects() {
  try {
    // 1. Najpierw zaloguj się
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "test123",
    });

    if (signInError) {
      console.error("Authentication error:", signInError);
      return;
    }

    if (!user) {
      console.error("No user returned after login");
      return;
    }

    console.log("Successfully authenticated");

    // 2. Pobierz wszystkie projekty użytkownika
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        created_at,
        final_score,
        test_cases (
          id,
          title,
          order_index
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return;
    }

    console.log("Projects fetched successfully");
    console.log("Number of projects:", projects.length);
    
    // Wyświetl szczegóły każdego projektu
    projects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}:`);
      console.log("- ID:", project.id);
      console.log("- Name:", project.name);
      console.log("- Created at:", project.created_at);
      console.log("- Final score:", project.final_score);
      console.log("- Test cases:", project.test_cases?.length || 0);
      
      if (project.test_cases && project.test_cases.length > 0) {
        console.log("  Test cases:");
        project.test_cases.forEach(testCase => {
          console.log(`  - ${testCase.title} (Order: ${testCase.order_index})`);
        });
      }
    });

  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Uruchom test
console.log("Starting Supabase API test - GET Projects...");

testGetProjects()
  .then(() => {
    console.log("\nTest completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
