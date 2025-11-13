-- migration: add bulk update test cases function
-- purpose: enable atomic bulk updates of multiple test cases in a single transaction
-- affected: test_cases table
-- rationale: eliminates race conditions from sequential updates and improves performance

-- create function to perform bulk update of test cases
-- uses jsonb for better compatibility with supabase client library
-- this function updates multiple test cases in a single transaction
-- ensuring data consistency and avoiding race conditions from the updated_at trigger
create or replace function bulk_update_test_cases(
  p_project_id uuid,
  p_user_id uuid,
  p_test_cases jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_test_case jsonb;
  v_test_case_id uuid;
  v_result jsonb[] := array[]::jsonb[];
  v_updated_record record;
begin
  -- validate that the project exists and belongs to the user
  if not exists (
    select 1 
    from projects 
    where projects.id = p_project_id 
      and projects.user_id = p_user_id
      and projects.deleted_at is null
  ) then
    raise exception 'project not found or access denied';
  end if;

  -- iterate through each test case in the jsonb array
  -- this happens in a single transaction, avoiding race conditions
  for v_test_case in select * from jsonb_array_elements(p_test_cases)
  loop
    v_test_case_id := (v_test_case->>'id')::uuid;
    
    -- update the test case if it exists and belongs to the project
    update test_cases
    set
      title = coalesce(v_test_case->>'title', test_cases.title),
      preconditions = v_test_case->>'preconditions',
      steps = coalesce(v_test_case->>'steps', test_cases.steps),
      expected_result = coalesce(v_test_case->>'expected_result', test_cases.expected_result),
      order_index = coalesce((v_test_case->>'order_index')::integer, test_cases.order_index),
      updated_at = now()
    where test_cases.id = v_test_case_id
      and test_cases.project_id = p_project_id
      and test_cases.deleted_at is null
    returning * into v_updated_record;
    
    -- verify the update succeeded
    if not found then
      raise exception 'test case % not found or already deleted', v_test_case_id;
    end if;
    
    -- add updated record to result array
    v_result := array_append(v_result, jsonb_build_object(
      'id', v_updated_record.id,
      'title', v_updated_record.title,
      'preconditions', v_updated_record.preconditions,
      'steps', v_updated_record.steps,
      'expected_result', v_updated_record.expected_result,
      'order_index', v_updated_record.order_index
    ));
  end loop;

  -- return all updated test cases as jsonb array
  return array_to_json(v_result)::jsonb;
end;
$$;

-- grant execute permission to authenticated users
-- this allows the application to call the function through supabase
grant execute on function bulk_update_test_cases(uuid, uuid, jsonb) to authenticated;

-- add comment explaining the function's purpose
comment on function bulk_update_test_cases is 
  'atomically updates multiple test cases in a single transaction to avoid race conditions';

