import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewCaseModal } from "./NewCaseModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  BarChart3
} from "lucide-react";

// Mock data
const mockContracts = [
  {
    id: 1,
    name: "Service Agreement - ABC Corp",
    uploadDate: "2024-01-15",
    status: "reviewed",
    riskLevel: "low",
    deadline: "2024-02-15",
    parties: ["Your Firm", "ABC Corporation"],
    notes: "Standard service agreement with favorable terms."
  },
  {
    id: 2,
    name: "Employment Contract - John Doe",
    uploadDate: "2024-01-10",
    status: "pending",
    riskLevel: "medium",
    deadline: "2024-01-25",
    parties: ["Your Firm", "John Doe"],
    notes: "Non-compete clause needs review."
  },
  {
    id: 3,
    name: "Lease Agreement - Downtown Office",
    uploadDate: "2024-01-08",
    status: "flagged",
    riskLevel: "high",
    deadline: "2024-01-20",
    parties: ["Your Firm", "Property Management LLC"],
    notes: "Unusual termination clauses flagged by AI."
  }
];

const mockTimeEntries = [
  { id: 1, client: "ABC Corp", task: "Contract review", hours: 2.5, rate: 350, date: "2024-01-15" },
  { id: 2, client: "John Doe", task: "Employment consultation", hours: 1.0, rate: 300, date: "2024-01-14" },
  { id: 3, client: "Property Management", task: "Lease negotiation", hours: 3.0, rate: 400, date: "2024-01-13" }
];

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

export const Dashboard = () => {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [timeEntry, setTimeEntry] = useState({ client: "", task: "", hours: "", rate: "" });
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "default";
    }
  };


  const fetchCases = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
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

  const totalBillableHours = mockTimeEntries.reduce((acc, entry) => acc + entry.hours, 0);
  const totalBillableAmount = mockTimeEntries.reduce((acc, entry) => acc + (entry.hours * entry.rate), 0);

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
            <Button variant="legal-outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Team
            </Button>
            <Button variant="legal" size="sm" onClick={() => setShowNewCaseModal(true)}>
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
                  <p className="text-2xl font-bold">{totalBillableHours}</p>
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
                  <p className="text-2xl font-bold">3</p>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <Input
                    placeholder="Client name"
                    value={timeEntry.client}
                    onChange={(e) => setTimeEntry({...timeEntry, client: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hours</label>
                  <Input
                    type="number"
                    step="0.25"
                    placeholder="2.5"
                    value={timeEntry.hours}
                    onChange={(e) => setTimeEntry({...timeEntry, hours: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Task Description</label>
                <Input
                  placeholder="Brief description of work performed"
                  value={timeEntry.task}
                  onChange={(e) => setTimeEntry({...timeEntry, task: e.target.value})}
                />
              </div>
              <Button variant="legal" className="w-full">
                Log Time Entry
              </Button>
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
            <CardDescription>
              All your legal cases and their current status
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
            <CardDescription>
              Recent time entries and billing overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTimeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">{entry.client}</h4>
                    <p className="text-sm text-muted-foreground">{entry.task}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.hours} hrs</p>
                    <p className="text-sm text-muted-foreground">${entry.rate}/hr</p>
                    <p className="font-bold text-legal-purple">${(entry.hours * entry.rate).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <Button variant="legal-outline" className="w-full">
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
    </div>
  );
};