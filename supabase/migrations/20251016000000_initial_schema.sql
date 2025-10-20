-- Migration: Initial Schema Creation
-- Description: Creates core tables for profiles, projects, and test cases with RLS policies
-- Tables: profiles, projects, test_cases
-- Author: AI Assistant
-- Date: 2025-10-16

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create profiles table to store additional user data
create table profiles (
    id uuid primary key references auth.users on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table profiles is 'Public profiles of users for additional data';

-- Enable RLS on profiles table
alter table profiles enable row level security;

-- RLS policies for profiles table
create policy "Users can view any profile"
    on profiles
    for select
    to authenticated
    using (true);

create policy "Users can update own profile"
    on profiles
    for update
    to authenticated
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on profiles
    for insert
    to authenticated
    with check (auth.uid() = id);

-- Create trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Projects table references profiles
create table projects (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references profiles(id) on delete cascade,
    name varchar(255) not null,
    final_score decimal(3,2) check (final_score >= 0 and final_score <= 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

comment on table projects is 'User projects containing test cases';
comment on column projects.final_score is 'Project score from 0 to 5';
comment on column projects.deleted_at is 'Soft delete timestamp';

-- Enable RLS on projects table
alter table projects enable row level security;

-- RLS policies for projects table
create policy "Users can view their own projects"
    on projects
    for select
    to authenticated
    using (user_id = auth.uid());

create policy "Users can create their own projects"
    on projects
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Users can update their own projects"
    on projects
    for update
    to authenticated
    using (user_id = auth.uid());

create policy "Users can delete their own projects"
    on projects
    for delete
    to authenticated
    using (user_id = auth.uid());

-- Create test_cases table
create table test_cases (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references projects(id) on delete cascade,
    title varchar(255) not null,
    preconditions text,
    steps text not null,
    expected_result text not null,
    order_index integer not null check (order_index >= 0),
    created_at timestamptz not null default now(),
    -- Ensure order_index is unique within a project
    unique(project_id, order_index),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

create index idx_test_cases_order on test_cases(project_id, order_index);

comment on table test_cases is 'Test cases belonging to projects';
comment on column test_cases.order_index is 'Order of test cases within a project';
comment on column test_cases.deleted_at is 'Soft delete timestamp';

-- Enable RLS on test_cases table
alter table test_cases enable row level security;

-- RLS policies for test_cases table
create policy "Users can view their own test cases"
    on test_cases
    for select
    to authenticated
    using (project_id in (
        select id from projects
        where user_id = auth.uid()
    ));

create policy "Users can create test cases in their projects"
    on test_cases
    for insert
    to authenticated
    with check (project_id in (
        select id from projects
        where user_id = auth.uid()
    ));

create policy "Users can update their own test cases"
    on test_cases
    for update
    to authenticated
    using (project_id in (
        select id from projects
        where user_id = auth.uid()
    ));

create policy "Users can delete their own test cases"
    on test_cases
    for delete
    to authenticated
    using (project_id in (
        select id from projects
        where user_id = auth.uid()
    ));

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers to automatically update updated_at
create trigger update_projects_updated_at
    before update on projects
    for each row
    execute function update_updated_at_column();

create trigger update_test_cases_updated_at
    before update on test_cases
    for each row
    execute function update_updated_at_column();

-- Create function to validate test case limit per project
create or replace function validate_test_case_limit()
returns trigger as $$
begin
    if (
        select count(*)
        from test_cases
        where project_id = new.project_id
        and deleted_at is null
    ) >= 20 then
        raise exception 'Maximum limit of 20 test cases per project reached';
    end if;
    return new;
end;
$$ language plpgsql;

-- Create trigger to enforce test case limit
create trigger enforce_test_case_limit
    before insert on test_cases
    for each row
    execute function validate_test_case_limit();

-- Create function to get next available order_index for a project
create or replace function get_next_test_case_order(p_project_id uuid)
returns integer as $$
declare
    next_order integer;
begin
    select coalesce(max(order_index) + 1, 0)
    into next_order
    from test_cases
    where project_id = p_project_id
    and deleted_at is null;
    
    return next_order;
end;
$$ language plpgsql;

-- Create function to handle test case reordering
create or replace function reorder_test_cases()
returns trigger as $$
begin
    -- If no explicit order_index is provided, append to the end
    if new.order_index is null then
        new.order_index := get_next_test_case_order(new.project_id);
    else
        -- Shift existing test cases to make room for the new one
        update test_cases
        set order_index = order_index + 1
        where project_id = new.project_id
        and order_index >= new.order_index
        and id != coalesce(new.id, uuid_nil())
        and deleted_at is null;
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create trigger for handling test case ordering
create trigger handle_test_case_ordering
    before insert or update on test_cases
    for each row
    execute function reorder_test_cases();

-- Create function to compact order_index values
create or replace function compact_test_case_order(p_project_id uuid)
returns void as $$
declare
    r record;
    new_order integer := 0;
begin
    for r in (
        select id
        from test_cases
        where project_id = p_project_id
        and deleted_at is null
        order by order_index
    ) loop
        update test_cases
        set order_index = new_order
        where id = r.id;
        
        new_order := new_order + 1;
    end loop;
end;
$$ language plpgsql;
