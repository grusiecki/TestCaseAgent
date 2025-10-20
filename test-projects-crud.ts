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

async function testProjectsCRUD() {
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

    // 2. CREATE - Utwórz nowy projekt
    const { data: createdProject, error: createError } = await supabase
      .from("projects")
      .insert({
        name: "Test CRUD Project",
        user_id: user.id,
      })
      .select("id, name, created_at, final_score")
      .single();

    if (createError) {
      console.error("Project creation error:", createError);
      return;
    }

    console.log("Project created successfully:", createdProject);

    // 3. READ - Pobierz utworzony projekt
    const { data: readProject, error: readError } = await supabase
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
      .eq("id", createdProject.id)
      .single();

    if (readError) {
      console.error("Error reading project:", readError);
      return;
    }

    console.log("Project read successfully:", readProject);

    // 4. UPDATE - Zaktualizuj nazwę projektu
    const newName = "Updated CRUD Project";
    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({ name: newName })
      .eq("id", createdProject.id)
      .select("id, name, created_at, final_score")
      .single();

    if (updateError) {
      console.error("Error updating project:", updateError);
      return;
    }

    console.log("Project updated successfully:", updatedProject);

    // Sprawdź czy nazwa została zaktualizowana
    if (updatedProject.name !== newName) {
      throw new Error(`Project name not updated correctly. Expected: ${newName}, Got: ${updatedProject.name}`);
    }

    // 5. DELETE - Usuń projekt
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", createdProject.id);

    if (deleteError) {
      console.error("Error deleting project:", deleteError);
      return;
    }

    console.log("Project deleted successfully");

    // Sprawdź czy projekt został usunięty
    const { data: deletedProject, error: checkDeleteError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", createdProject.id)
      .single();

    if (checkDeleteError?.code !== "PGRST116") { // kod błędu dla "nie znaleziono rekordu"
      console.error("Project might not have been deleted properly");
      return;
    }

    console.log("Verified project was deleted");

  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
}

// Uruchom test
console.log("Starting Projects CRUD test...");

testProjectsCRUD()
  .then(() => {
    console.log("All CRUD tests completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("CRUD tests failed:", error);
    process.exit(1);
  });
