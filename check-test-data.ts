import { createClient } from "@supabase/supabase-js";
import type { Database } from "./src/db/database.types";
import * as dotenv from "dotenv";

// Załaduj zmienne środowiskowe
dotenv.config();

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
  db: {
    schema: "public",
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkTestData() {
  try {
    // 1. Zaloguj się
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "test123",
    });

    if (signInError || !user) {
      console.error("Authentication error");
      return;
    }

    // 2. Pobierz wszystkie projekty użytkownika
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        created_at,
        test_cases (
          id,
          title,
          order_index
        )
      `)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching projects");
      return;
    }

    console.log("\n=== Test Data Summary ===\n");
    console.log(`Found ${projects.length} project(s)\n`);

    projects.forEach((project, index) => {
      console.log(`Project ${index + 1}:`);
      console.log("- Name:", project.name);
      console.log("- Created:", new Date(project.created_at).toLocaleString());
      console.log("- Test Cases:", project.test_cases.length);
      
      if (project.test_cases.length > 0) {
        console.log("\n  Test Cases:");
        project.test_cases
          .sort((a, b) => a.order_index - b.order_index)
          .forEach(testCase => {
            console.log(`  ${testCase.order_index + 1}. ${testCase.title}`);
          });
      }
      console.log("\n---\n");
    });

  } catch (error) {
    console.error("Error checking test data:", error);
  }
}

// Uruchom sprawdzenie
console.log("Checking test data in Supabase...");
checkTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
