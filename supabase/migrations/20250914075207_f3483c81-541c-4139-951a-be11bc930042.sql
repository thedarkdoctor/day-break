-- Create a fake user profile for "adam" (test admin)
INSERT INTO public.profiles (user_id, full_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Adam Test Admin');

-- Create a "test team" owned by adam
INSERT INTO public.teams (name, description, owner_id)
VALUES ('test team', 'Test team for billing functionality', '11111111-1111-1111-1111-111111111111');

-- Add adam as the owner member of the team
INSERT INTO public.team_members (user_id, team_id, role)
SELECT '11111111-1111-1111-1111-111111111111', teams.id, 'owner'
FROM teams 
WHERE teams.name = 'test team' AND teams.owner_id = '11111111-1111-1111-1111-111111111111';