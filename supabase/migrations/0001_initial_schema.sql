-- Initial schema for AI Full-Stack Starter
-- Creates projects table with RLS policies

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_owner_name_unique UNIQUE(owner_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own projects
CREATE POLICY "users_select_own_projects" ON public.projects
  FOR SELECT
  USING (auth.uid() = owner_id);

-- RLS Policy: Users can insert their own projects
CREATE POLICY "users_insert_own_projects" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Users can update their own projects
CREATE POLICY "users_update_own_projects" ON public.projects
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Users can delete their own projects
CREATE POLICY "users_delete_own_projects" ON public.projects
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create indexes for performance
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
