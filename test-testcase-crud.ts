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

async function testTestCasesCRUD() {
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

    // 2. Najpierw utwórz projekt, do którego będą należeć test case'y
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: "Project for Test Cases",
        user_id: user.id,
      })
      .select("id")
      .single();

    if (projectError) {
      console.error("Project creation error:", projectError);
      return;
    }

    console.log("Project created successfully:", project);

    // 3. CREATE - Utwórz nowy test case
    const { data: createdTestCase, error: createError } = await supabase
      .from("test_cases")
      .insert({
        project_id: project.id,
        title: "Test Case 1",
        description: "This is a test case description",
        expected_result: "Expected test result",
        test_steps: ["Step 1", "Step 2", "Step 3"],
        order_index: 1,
        status: "draft",
        priority: "medium",
      })
      .select("id, title, description, expected_result, test_steps, order_index, status, priority, created_at")
      .single();

    if (createError) {
      console.error("Test case creation error:", createError);
      return;
    }

    console.log("Test case created successfully:", createdTestCase);

    // 4. READ - Pobierz utworzony test case
    const { data: readTestCase, error: readError } = await supabase
      .from("test_cases")
      .select(`
        id,
        title,
        description,
        expected_result,
        test_steps,
        order_index,
        status,
        priority,
        created_at,
        project_id
      `)
      .eq("id", createdTestCase.id)
      .single();

    if (readError) {
      console.error("Error reading test case:", readError);
      return;
    }

    console.log("Test case read successfully:", readTestCase);

    // 5. UPDATE - Zaktualizuj test case
    const updatedTitle = "Updated Test Case 1";
    const updatedStatus = "ready";
    const { data: updatedTestCase, error: updateError } = await supabase
      .from("test_cases")
      .update({
        title: updatedTitle,
        status: updatedStatus,
        test_steps: ["Updated Step 1", "Updated Step 2", "Updated Step 3"],
      })
      .eq("id", createdTestCase.id)
      .select("id, title, description, expected_result, test_steps, order_index, status, priority")
      .single();

    if (updateError) {
      console.error("Error updating test case:", updateError);
      return;
    }

    console.log("Test case updated successfully:", updatedTestCase);

    // Sprawdź czy dane zostały zaktualizowane
    if (updatedTestCase.title !== updatedTitle || updatedTestCase.status !== updatedStatus) {
      throw new Error(
        `Test case not updated correctly. Expected title: ${updatedTitle}, status: ${updatedStatus}. Got title: ${updatedTestCase.title}, status: ${updatedTestCase.status}`
      );
    }

    // 6. SOFT DELETE - Wykonaj soft delete test case'a
    const { error: softDeleteError } = await supabase
      .from("test_cases")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", createdTestCase.id);

    if (softDeleteError) {
      console.error("Error soft deleting test case:", softDeleteError);
      return;
    }

    console.log("Test case soft deleted successfully");

    // Sprawdź czy test case został oznaczony jako usunięty
    const { data: softDeletedTestCase, error: checkSoftDeleteError } = await supabase
      .from("test_cases")
      .select("deleted_at")
      .eq("id", createdTestCase.id)
      .single();

    if (checkSoftDeleteError) {
      console.error("Error checking soft deleted test case:", checkSoftDeleteError);
      return;
    }

    if (!softDeletedTestCase.deleted_at) {
      throw new Error("Test case was not soft deleted properly");
    }

    console.log("Verified test case was soft deleted");

    // 7. Cleanup - Usuń projekt (kaskadowo usunie też test case'y)
    const { error: cleanupError } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
      return;
    }

    console.log("Cleanup completed successfully");

  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
}

// Uruchom test
console.log("Starting Test Cases CRUD test...");

testTestCasesCRUD()
  .then(() => {
    console.log("All CRUD tests completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("CRUD tests failed:", error);
    process.exit(1);
  });
