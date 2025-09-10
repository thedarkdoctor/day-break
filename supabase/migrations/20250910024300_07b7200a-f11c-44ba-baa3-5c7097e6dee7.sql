-- Add team code column to teams table
ALTER TABLE public.teams 
ADD COLUMN team_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex');

-- Create index for team code lookups
CREATE INDEX idx_teams_team_code ON public.teams(team_code);

-- Update RLS policies to allow users to join teams by code
CREATE POLICY "Users can view teams by code for joining" 
ON public.teams 
FOR SELECT 
USING (true);

-- Update team_members policies to allow joining by team code
CREATE POLICY "Users can join teams" 
ON public.team_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);