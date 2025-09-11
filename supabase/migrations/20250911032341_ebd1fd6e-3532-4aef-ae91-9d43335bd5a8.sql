-- Fix infinite recursion in team_members RLS policy
-- The current policy is trying to query the same table it's applied to, causing recursion

-- Create a security definer function to get user's team IDs safely
CREATE OR REPLACE FUNCTION public.get_user_team_ids(_user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(team_id)
  FROM team_members
  WHERE user_id = _user_id;
$$;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view team members for teams they belong to" ON public.team_members;

-- Create a new non-recursive policy using the security definer function
CREATE POLICY "Users can view team members for teams they belong to" 
ON public.team_members 
FOR SELECT 
USING (
  team_id = ANY(public.get_user_team_ids(auth.uid()))
);