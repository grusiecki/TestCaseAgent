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
// Inicjalizacja klienta Supabase z dodatkowymi opcjami
const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
  db: {
    schema: "public",
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testCreateProject() {
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

    // 2. Utwórz nowy projekt z ID zalogowanego użytkownika
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: "E-commerce Testing Project",
        user_id: user.id, // Używamy ID zalogowanego użytkownika
      })
      .select("id, name, created_at, final_score")
      .single();

    if (projectError) {
      console.error("Project creation error:", projectError);
      return;
    }

    console.log("Project created successfully");

    // 3. Dodaj test case'y
    const testCases = ["User Registration Flow", "Product Search and Filtering"].map((title, index) => ({
      project_id: project.id,
      title,
      order_index: index,
      steps: "",
      expected_result: "",
    }));

    const { data: testCasesData, error: testCasesError } = await supabase
      .from("test_cases")
      .insert(testCases)
      .select("id, title, order_index");

    if (testCasesError) {
      console.error("Test cases creation error:", testCasesError);
      return;
    }

    console.log("Test cases created successfully");

    // 4. Pobierz pełne dane projektu z test case'ami
    const { data: fullProject, error: fetchError } = await supabase
      .from("projects")
      .select(
        `
        id,
        name,
        created_at,
        final_score,
        test_cases (
          id,
          title,
          order_index
        )
      `
      )
      .eq("id", project.id)
      .single();

    if (fetchError) {
      console.error("Error fetching full project:", fetchError);
      return;
    }

    console.log("Project data fetched successfully");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Uruchom test
console.log("Starting Supabase API test...");

testCreateProject()
  .then(() => {
    console.log("Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
