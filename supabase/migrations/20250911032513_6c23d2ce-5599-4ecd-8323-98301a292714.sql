-- Fix infinite recursion in teams table RLS policy
-- The issue is with the "Users can view teams they are members of" policy

-- Create a security definer function to safely check team membership
CREATE OR REPLACE FUNCTION public.is_user_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members
    WHERE user_id = _user_id AND team_id = _team_id
  );
$$;

-- Drop the problematic recursive policy on teams table
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;

-- Create a new non-recursive policy using the security definer function
CREATE POLICY "Users can view teams they are members of" 
ON public.teams 
FOR SELECT 
USING (
  public.is_user_team_member(auth.uid(), id)
);