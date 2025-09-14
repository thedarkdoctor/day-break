import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewCaseModal } from "./NewCaseModal";
import { ManageTeamsModal } from "./ManageTeamsModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Scale, 
  Upload, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Edit,
  Save,
  X,
  Trash2,
  User,
  Settings,
  LogOut,
  Crown,
  UserPlus
} from "lucide-react";

interface Case {
  id: string;
  title: string;
  client_name: string;
  case_type: string;
  status: string;
  priority: string;
  description?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

interface TimeEntry {
  id: string;
  client_name: string;
  task_description: string;
  hours: number;
  hourly_rate: number;
  total_amount: number;
  date: string;
  created_at: string;
}

// EditCaseForm component
interface EditCaseFormProps {
  case: Case;
  onUpdate: (updatedCase: Case) => void;
  onDelete: () => void;
}

const EditCaseForm = ({ case: caseData, onUpdate, onDelete }: EditCaseFormProps) => {
  const [formData, setFormData] = useState<Case>(caseData);

  const handleChange = (field: keyof Case, value: string) => {
    const updatedCase = { ...formData, [field]: value };
    setFormData(updatedCase);
    onUpdate(updatedCase);
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Case Details</h3>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Case
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Case Title</label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter case title"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Client Name</label>
          <Input
            value={formData.client_name}
            onChange={(e) => handleChange('client_name', e.target.value)}
            placeholder="Enter client name"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Case Type</label>
          <Input
            value={formData.case_type}
            onChange={(e) => handleChange('case_type', e.target.value)}
            placeholder="e.g. Civil Litigation"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select 
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Priority</label>
          <select 
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Deadline</label>
          <Input
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => handleChange('deadline', e.target.value)}
          />
        </div>
        <div></div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Case description or notes"
          rows={3}
        />
      </div>
    </div>
  );
};

// EditTimeEntryForm component
interface EditTimeEntryFormProps {
  timeEntry: TimeEntry;
  onUpdate: (updatedEntry: TimeEntry) => void;
  onDelete: () => void;
}

const EditTimeEntryForm = ({ timeEntry, onUpdate, onDelete }: EditTimeEntryFormProps) => {
  const [formData, setFormData] = useState<TimeEntry>(timeEntry);

  const handleChange = (field: keyof TimeEntry, value: string | number) => {
    const updatedEntry = { ...formData, [field]: value };
    
    // Recalculate total_amount when hours or hourly_rate changes
    if (field === 'hours' || field === 'hourly_rate') {
      const hours = field === 'hours' ? Number(value) : formData.hours;
      const rate = field === 'hourly_rate' ? Number(value) : formData.hourly_rate;
      updatedEntry.total_amount = hours * rate;
    }
    
    setFormData(updatedEntry);
    onUpdate(updatedEntry);
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Time Entry Details</h3>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Entry
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Client Name</label>
          <Input
            value={formData.client_name}
            onChange={(e) => handleChange('client_name', e.target.value)}
            placeholder="Enter client name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Hours</label>
          <Input
            type="number"
            step="0.25"
            min="0"
            value={formData.hours}
            onChange={(e) => handleChange('hours', Number(e.target.value))}
            placeholder="2.5"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Hourly Rate ($)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.hourly_rate}
            onChange={(e) => handleChange('hourly_rate', Number(e.target.value))}
            placeholder="350.00"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Task Description</label>
        <Textarea
          value={formData.task_description}
          onChange={(e) => handleChange('task_description', e.target.value)}
          placeholder="Brief description of work performed"
          rows={2}
        />
      </div>

      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Amount:</span>
          <span className="font-bold text-legal-purple">${formData.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [timeEntry, setTimeEntry] = useState({ client: "", task: "", hours: "", rate: "" });
  const [timeEntryLoading, setTimeEntryLoading] = useState(false);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showEditCasesModal, setShowEditCasesModal] = useState(false);
  const [showEditTimeEntriesModal, setShowEditTimeEntriesModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [editingCases, setEditingCases] = useState<Case[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [editingTimeEntries, setEditingTimeEntries] = useState<TimeEntry[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [ownedTeams, setOwnedTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and teams
  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      // Fetch teams user is member of
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams:team_id (
            id,
            name,
            description,
            owner_id
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      
      // Fetch teams user owns
      const { data: ownerTeams, error: ownerError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);

      if (ownerError) throw ownerError;

      setTeams(memberTeams?.map(mt => ({ ...mt.teams, role: mt.role })) || []);
      setOwnedTeams(ownerTeams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    }
  };

  const fetchCases = async () => {
    console.log('fetchCases called, user:', user);
    if (!user) {
      console.log('No user found, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching cases for user ID:', user.id);
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });
      if (error) throw error;
      setCases(data || []);
      console.log('Cases set:', data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const exportToCSV = async () => {
    if (!user) return;
    
    try {
      // Fetch ALL time entries for export (no limit)
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error("No time entries to export");
        return;
      }

      // Create CSV headers
      const headers = ['Date', 'Client Name', 'Task Description', 'Hours', 'Hourly Rate', 'Total Amount'];
      
      // Create CSV rows
      const csvRows = data.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        entry.client_name,
        entry.task_description.replace(/"/g, '""'), // Escape quotes in task description
        entry.hours.toString(),
        entry.hourly_rate.toString(),
        entry.total_amount.toString()
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `billing_tracker_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Billing data exported successfully");
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error("Failed to export billing data");
    }
  };

  // Handle editing time entries
  const handleEditTimeEntries = () => {
    setEditingTimeEntries([...timeEntries]);
    setShowEditTimeEntriesModal(true);
  };

  const handleSaveTimeEntries = async () => {
    try {
      // Find time entries to update
      const entriesToUpdate = editingTimeEntries.filter(editingEntry => {
        const originalEntry = timeEntries.find(e => e.id === editingEntry.id);
        return originalEntry && JSON.stringify(originalEntry) !== JSON.stringify(editingEntry);
      });

      // Find time entries to delete
      const entriesToDelete = timeEntries.filter(originalEntry => 
        !editingTimeEntries.find(editingEntry => editingEntry.id === originalEntry.id)
      );

      // Update time entries
      for (const entry of entriesToUpdate) {
        const { error } = await supabase
          .from('time_entries')
          .update({
            client_name: entry.client_name,
            task_description: entry.task_description,
            hours: entry.hours,
            hourly_rate: entry.hourly_rate,
            date: entry.date
          })
          .eq('id', entry.id);

        if (error) throw error;
      }

      // Delete time entries
      for (const entry of entriesToDelete) {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', entry.id);

        if (error) throw error;
      }

      // Refresh time entries
      await fetchTimeEntries();
      setShowEditTimeEntriesModal(false);
      setEditingTimeEntries([]);
      toast.success("Time entries updated successfully");
    } catch (error) {
      console.error('Error updating time entries:', error);
      toast.error("Failed to update time entries");
    }
  };

  const handleTimeEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !timeEntry.client || !timeEntry.task || !timeEntry.hours || !timeEntry.rate) {
      toast.error("Please fill in all fields");
      return;
    }

    setTimeEntryLoading(true);
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          client_name: timeEntry.client,
          task_description: timeEntry.task,
          hours: parseFloat(timeEntry.hours),
          hourly_rate: parseFloat(timeEntry.rate)
        });

      if (error) throw error;

      toast.success("Time entry logged successfully!");
      setTimeEntry({ client: "", task: "", hours: "", rate: "" });
      fetchTimeEntries();
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast.error("Failed to log time entry. Please try again.");
    } finally {
      setTimeEntryLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchTimeEntries();
    fetchProfile();
    fetchTeams();
  }, [user]);

  const handleCaseCreated = () => {
    fetchCases();
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "active": return <Clock className="h-4 w-4 text-warning" />;
      case "on-hold": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const totalBillableHours = timeEntries.reduce((acc, entry) => acc + entry.hours, 0);
  const totalBillableAmount = timeEntries.reduce((acc, entry) => acc + entry.total_amount, 0);
  
  // Calculate upcoming deadlines (within next 30 days)
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return cases.filter(case_ => {
      if (!case_.deadline) return false;
      const deadline = new Date(case_.deadline);
      return deadline >= today && deadline <= thirtyDaysFromNow;
    }).length;
  };
  
  const upcomingDeadlines = getUpcomingDeadlines();

  // Handle editing cases
  const handleEditCases = () => {
    setEditingCases([...cases]);
    setShowEditCasesModal(true);
  };

  const handleSaveCases = async () => {
    try {
      // Find cases to update
      const casesToUpdate = editingCases.filter(editingCase => {
        const originalCase = cases.find(c => c.id === editingCase.id);
        return originalCase && JSON.stringify(originalCase) !== JSON.stringify(editingCase);
      });

      // Find cases to delete (cases that were in original but not in editing)
      const casesToDelete = cases.filter(originalCase => 
        !editingCases.find(editingCase => editingCase.id === originalCase.id)
      );

      // Update cases
      for (const case_ of casesToUpdate) {
        const { error } = await supabase
          .from('cases')
          .update({
            title: case_.title,
            client_name: case_.client_name,
            case_type: case_.case_type,
            status: case_.status,
            priority: case_.priority,
            description: case_.description,
            deadline: case_.deadline
          })
          .eq('id', case_.id);

        if (error) throw error;
      }

      // Delete cases
      for (const case_ of casesToDelete) {
        const { error } = await supabase
          .from('cases')
          .delete()
          .eq('id', case_.id);

        if (error) throw error;
      }

      // Refresh cases
      await fetchCases();
      setShowEditCasesModal(false);
      setEditingCases([]);
      toast.success("Cases updated successfully");
    } catch (error) {
      console.error('Error updating cases:', error);
      toast.error("Failed to update cases");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-legal-purple mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Day Break</h1>
              <p className="text-muted-foreground">Legal Practice Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="legal-outline" 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            <ManageTeamsModal />
            <Button variant="legal" size="sm" onClick={() => {
              console.log('New Case button clicked');
              setShowNewCaseModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold">{cases.filter(c => c.status === 'active').length}</p>
                </div>
                <FileText className="h-8 w-8 text-legal-purple" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Billable Hours</p>
                  <p className="text-2xl font-bold">{totalBillableHours.toFixed(1)}</p>
                </div>
                <Clock className="h-8 w-8 text-legal-purple" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Billed</p>
                  <p className="text-2xl font-bold">${totalBillableAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-legal-purple" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold">{upcomingDeadlines}</p>
                </div>
                <Calendar className="h-8 w-8 text-legal-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Contract Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-legal-purple" />
                AI Contract Review
              </CardTitle>
              <CardDescription>
                Upload contracts for AI analysis and risk detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop PDF or DOCX files here, or click to browse
                </p>
                <Button variant="legal-outline">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Time Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-legal-purple" />
                Quick Time Entry
              </CardTitle>
              <CardDescription>
                Log billable hours for your cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTimeEntrySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Client</label>
                    <Input
                      placeholder="Client name"
                      value={timeEntry.client}
                      onChange={(e) => setTimeEntry({...timeEntry, client: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hours</label>
                    <Input
                      type="number"
                      step="0.25"
                      min="0"
                      placeholder="2.5"
                      value={timeEntry.hours}
                      onChange={(e) => setTimeEntry({...timeEntry, hours: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Task Description</label>
                    <Input
                      placeholder="Brief description of work performed"
                      value={timeEntry.task}
                      onChange={(e) => setTimeEntry({...timeEntry, task: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hourly Rate ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="350.00"
                      value={timeEntry.rate}
                      onChange={(e) => setTimeEntry({...timeEntry, rate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="legal" className="w-full" disabled={timeEntryLoading}>
                  {timeEntryLoading ? "Logging..." : "Log Time Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Cases Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-legal-purple" />
              Cases Dashboard
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>All your legal cases and their current status</span>
              {cases.length > 0 && (
                <Button 
                  variant="legal-outline" 
                  size="sm" 
                  onClick={handleEditCases}
                  className="ml-4"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Cases
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-purple"></div>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No cases yet</p>
                <Button variant="legal" onClick={() => setShowNewCaseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Case
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((case_) => (
                  <div
                    key={case_.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(case_.status)}
                        <div>
                          <h4 className="font-medium">{case_.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Client: {case_.client_name} • Type: {case_.case_type}
                          </p>
                          {case_.deadline && (
                            <p className="text-xs text-muted-foreground">
                              Deadline: {new Date(case_.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(case_.priority)}>
                          {case_.priority} priority
                        </Badge>
                        <Badge variant="outline">{case_.status}</Badge>
                      </div>
                    </div>
                    
                    {case_.description && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">{case_.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-legal-purple" />
              Billing Tracker
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Recent time entries and billing overview</span>
              {timeEntries.length > 0 && (
                <Button 
                  variant="legal-outline" 
                  size="sm" 
                  onClick={handleEditTimeEntries}
                  className="ml-4"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Entries
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeEntries.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No time entries yet</p>
                </div>
              ) : (
                timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{entry.client_name}</h4>
                      <p className="text-sm text-muted-foreground">{entry.task_description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{entry.hours} hrs</p>
                      <p className="text-sm text-muted-foreground">${entry.hourly_rate}/hr</p>
                      <p className="font-bold text-legal-purple">${entry.total_amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Hours:</span>
                  <span className="font-bold">{totalBillableHours.toFixed(2)} hrs</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <span className="font-bold text-legal-purple">${totalBillableAmount.toLocaleString()}</span>
                </div>
                <Button variant="legal-outline" className="w-full" onClick={exportToCSV}>
                  Export to CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewCaseModal 
        open={showNewCaseModal}
        onOpenChange={setShowNewCaseModal}
        onCaseCreated={handleCaseCreated}
      />

      {/* Edit Cases Modal */}
      {showEditCasesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Edit Cases</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingCases([]);
                  setShowEditCasesModal(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="space-y-6">
                {editingCases.map((case_, index) => (
                  <EditCaseForm 
                    key={case_.id}
                    case={case_}
                    onUpdate={(updatedCase) => {
                      const newCases = [...editingCases];
                      newCases[index] = updatedCase;
                      setEditingCases(newCases);
                    }}
                    onDelete={() => {
                      const newCases = editingCases.filter((_, i) => i !== index);
                      setEditingCases(newCases);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button 
                variant="outline"
                onClick={() => {
                  setEditingCases([]);
                  setShowEditCasesModal(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="legal"
                onClick={handleSaveCases}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Time Entries Modal */}
      {showEditTimeEntriesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Edit Time Entries</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingTimeEntries([]);
                  setShowEditTimeEntriesModal(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="space-y-6">
                {editingTimeEntries.map((entry, index) => (
                  <EditTimeEntryForm 
                    key={entry.id}
                    timeEntry={entry}
                    onUpdate={(updatedEntry) => {
                      const newEntries = [...editingTimeEntries];
                      newEntries[index] = updatedEntry;
                      setEditingTimeEntries(newEntries);
                    }}
                    onDelete={() => {
                      const newEntries = editingTimeEntries.filter((_, i) => i !== index);
                      setEditingTimeEntries(newEntries);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button 
                variant="outline"
                onClick={() => {
                  setEditingTimeEntries([]);
                  setShowEditTimeEntriesModal(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="legal"
                onClick={handleSaveTimeEntries}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Profile & Settings</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowProfileModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Profile Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-legal-purple" />
                      Profile Information
                    </h3>
                    <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{user?.email || 'Not available'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm">{profile?.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Lawyer Type</label>
                        <p className="text-sm">{profile?.lawyer_type || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">About</label>
                        <p className="text-sm">{profile?.about_yourself || 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-legal-purple" />
                      Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Email Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive notifications for deadlines and updates</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Dark Mode</p>
                          <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Auto-save Time Entries</p>
                          <p className="text-xs text-muted-foreground">Automatically save time entries as you type</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teams Information */}
                <div className="space-y-6">
                  
                  {/* Teams I'm Running */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-legal-purple" />
                      Teams I'm Running ({ownedTeams.length})
                    </h3>
                    <div className="space-y-3">
                      {ownedTeams.length === 0 ? (
                        <div className="text-center py-6 bg-muted/50 rounded-lg">
                          <Crown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">You're not running any teams yet</p>
                          <Button variant="legal" size="sm" className="mt-3">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Team
                          </Button>
                        </div>
                      ) : (
                        ownedTeams.map((team) => (
                          <div key={team.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{team.name}</h4>
                                <p className="text-xs text-muted-foreground">{team.description}</p>
                              </div>
                              <Badge variant="outline">Owner</Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Teams I'm Part Of */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-legal-purple" />
                      Teams I'm Part Of ({teams.length})
                    </h3>
                    <div className="space-y-3">
                      {teams.length === 0 ? (
                        <div className="text-center py-6 bg-muted/50 rounded-lg">
                          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">You're not part of any teams yet</p>
                          <Button variant="legal-outline" size="sm" className="mt-3">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Team
                          </Button>
                        </div>
                      ) : (
                        teams.map((team) => (
                          <div key={team.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{team.name}</h4>
                                <p className="text-xs text-muted-foreground">{team.description}</p>
                              </div>
                              <Badge variant="outline" className="capitalize">{team.role}</Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Logout */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </div>
              <Button 
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};