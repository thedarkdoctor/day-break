import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Copy, ChevronDown, UserMinus, Users, Plus, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  description: string | null;
  team_code: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  team_id: string;
  profiles?: {
    full_name: string | null;
  };
}

interface TeamWithMembers extends Team {
  team_members: TeamMember[];
  isOwner: boolean;
}

export function ManageTeamsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  
  // Create team form
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [createdTeamCode, setCreatedTeamCode] = useState('');
  
  // Join team form
  const [joinCode, setJoinCode] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch teams user is a member of or owns
      const { data: teamMemberships, error: membershipsError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            description,
            team_code,
            owner_id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      // Get all unique team IDs
      const teamIds = teamMemberships?.map(tm => tm.team_id) || [];
      
      if (teamIds.length === 0) {
        setTeams([]);
        return;
      }

      // Fetch all members for these teams with their profiles
      const { data: allMembers, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          team_id
        `)
        .in('team_id', teamIds);

      if (membersError) throw membersError;

      // Fetch profiles for all users
      const userIds = allMembers?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Combine data
      const teamsWithMembers: TeamWithMembers[] = teamMemberships
        .map(tm => {
          if (!tm.teams) return null;
          
          const team = tm.teams as Team;
          const teamMembers = allMembers?.filter(m => m.team_id === team.id).map(m => ({
            ...m,
            profiles: profiles?.find(p => p.user_id === m.user_id) || { full_name: null }
          })) || [];
          
          return {
            ...team,
            team_members: teamMembers,
            isOwner: team.owner_id === user.id
          };
        })
        .filter(Boolean) as TeamWithMembers[];

      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen, user]);

  const createTeam = async () => {
    if (!user || !teamName.trim()) return;
    
    setLoading(true);
    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName.trim(),
          description: teamDescription.trim() || null,
          owner_id: user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as a member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      setCreatedTeamCode(team.team_code);
      setTeamName('');
      setTeamDescription('');
      
      toast({
        title: "Team Created!",
        description: `Team "${team.name}" has been created successfully.`
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async () => {
    if (!user || !joinCode.trim()) return;
    
    setLoading(true);
    try {
      // Find team by code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('team_code', joinCode.trim())
        .single();

      if (teamError || !team) {
        toast({
          title: "Invalid Code",
          description: "Team code not found",
          variant: "destructive"
        });
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already a Member",
          description: "You are already a member of this team",
          variant: "destructive"
        });
        return;
      }

      // Join team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      setJoinCode('');
      toast({
        title: "Joined Team!",
        description: `Successfully joined "${team.name}"`
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: "Error",
        description: "Failed to join team",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const kickMember = async (teamId: string, memberId: string, memberName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: `${memberName} has been removed from the team`
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Team code copied to clipboard"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Manage Teams
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Teams</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view">View Teams</TabsTrigger>
            <TabsTrigger value="create">Create Team</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You're not part of any teams yet
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {team.name}
                                {team.isOwner && <Badge variant="secondary">Owner</Badge>}
                              </CardTitle>
                              {team.description && (
                                <CardDescription>{team.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{team.team_members.length} members</Badge>
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Label>Team Code:</Label>
                              <code className="px-2 py-1 bg-muted rounded text-sm">
                                {team.team_code}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(team.team_code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Team Members:</Label>
                              <div className="mt-2 space-y-2">
                                {team.team_members.map((member) => (
                                  <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                    <div className="flex items-center gap-2">
                                      <span>{member.profiles?.full_name || 'Unknown User'}</span>
                                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                        {member.role}
                                      </Badge>
                                    </div>
                                    {team.isOwner && member.user_id !== user?.id && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => kickMember(
                                          team.id, 
                                          member.id, 
                                          member.profiles?.full_name || 'User'
                                        )}
                                        disabled={loading}
                                      >
                                        <UserMinus className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Team
                </CardTitle>
                <CardDescription>
                  Create a team and get a unique code to share with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="teamDescription">Description (Optional)</Label>
                  <Textarea
                    id="teamDescription"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Describe your team's purpose"
                  />
                </div>
                
                <Button onClick={createTeam} disabled={loading || !teamName.trim()}>
                  Create Team
                </Button>
                
                {createdTeamCode && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-green-800">Team created successfully!</p>
                        <div className="flex items-center justify-center gap-2">
                          <Label>Share this code:</Label>
                          <code className="px-3 py-1 bg-green-100 rounded text-lg font-mono">
                            {createdTeamCode}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(createdTeamCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Join a Team
                </CardTitle>
                <CardDescription>
                  Enter a team code to join an existing team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="joinCode">Team Code</Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter team code"
                  />
                </div>
                
                <Button onClick={joinTeam} disabled={loading || !joinCode.trim()}>
                  Join Team
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}