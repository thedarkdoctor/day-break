-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team members junction table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they are members of" 
ON public.teams 
FOR SELECT 
USING (
  id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team owners can update their teams" 
ON public.teams 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams" 
ON public.teams 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Users can view team members for teams they belong to" 
ON public.team_members 
FOR SELECT 
USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team owners can manage team members" 
ON public.team_members 
FOR ALL 
USING (
  team_id IN (
    SELECT id FROM public.teams WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can leave teams" 
ON public.team_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for teams updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();