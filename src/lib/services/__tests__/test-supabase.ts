import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../db/database.types';

// Inicjalizacja klienta Supabase
const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

async function testCreateProject() {
  try {
    // 1. Najpierw zaloguj się
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'your.email@example.com',
      password: 'your_password'
    });

    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }

    console.log('Successfully authenticated:', authData.user?.id);

    // 2. Utwórz nowy projekt
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'E-commerce Testing Project',
        user_id: authData.user.id
      })
      .select('id, name, created_at, final_score')
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return;
    }

    console.log('Project created:', project);

    // 3. Dodaj test case'y
    const testCases = [
      'User Registration Flow',
      'Product Search and Filtering'
    ].map((title, index) => ({
      project_id: project.id,
      title,
      order_index: index,
      steps: '',
      expected_result: ''
    }));

    const { data: testCasesData, error: testCasesError } = await supabase
      .from('test_cases')
      .insert(testCases)
      .select('id, title, order_index');

    if (testCasesError) {
      console.error('Test cases creation error:', testCasesError);
      return;
    }

    console.log('Test cases created:', testCasesData);

    // 4. Pobierz pełne dane projektu z test case'ami
    const { data: fullProject, error: fetchError } = await supabase
      .from('projects')
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
      .eq('id', project.id)
      .single();

    if (fetchError) {
      console.error('Error fetching full project:', fetchError);
      return;
    }

    console.log('Full project data:', fullProject);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Uruchom test
testCreateProject()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
