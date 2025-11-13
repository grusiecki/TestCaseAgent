-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    final_score NUMERIC(3,2) CHECK (final_score >= 0 AND final_score <= 5),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create test_cases table
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    preconditions TEXT,
    steps TEXT NOT NULL DEFAULT '',
    expected_result TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_project_id ON public.test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_order ON public.test_cases(project_id, order_index);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

-- Projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Test cases policies
DROP POLICY IF EXISTS "Users can view test cases of their projects" ON public.test_cases;
CREATE POLICY "Users can view test cases of their projects"
    ON public.test_cases FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = test_cases.project_id
        AND projects.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create test cases in their projects" ON public.test_cases;
CREATE POLICY "Users can create test cases in their projects"
    ON public.test_cases FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = test_cases.project_id
        AND projects.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update test cases in their projects" ON public.test_cases;
CREATE POLICY "Users can update test cases in their projects"
    ON public.test_cases FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = test_cases.project_id
        AND projects.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete test cases in their projects" ON public.test_cases;
CREATE POLICY "Users can delete test cases in their projects"
    ON public.test_cases FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = test_cases.project_id
        AND projects.user_id = auth.uid()
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
-- Note: Using BEFORE triggers to modify NEW row before it's written
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_cases_updated_at ON public.test_cases;
CREATE TRIGGER update_test_cases_updated_at
    BEFORE UPDATE ON public.test_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
