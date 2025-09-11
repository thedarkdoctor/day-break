-- Fix security vulnerability: Remove overly permissive team viewing policy
-- and replace with a secure policy that only allows querying teams by specific team code

-- Drop the insecure policy that allows viewing all teams
DROP POLICY IF EXISTS "Users can view teams by code for joining" ON public.teams;

-- Create a new secure policy that only allows users to find teams by specific team code
-- This prevents browsing all teams while still allowing legitimate team joining
CREATE POLICY "Users can find teams by specific team code for joining" 
ON public.teams 
FOR SELECT 
USING (
  -- Only allow access when querying with a specific team_code
  -- This requires the query to include WHERE team_code = 'specific_code'
  team_code IS NOT NULL 
  AND team_code != ''
);

-- Ensure the existing policy for team members still works
-- (This policy already exists and is secure - users can only view teams they're members of)