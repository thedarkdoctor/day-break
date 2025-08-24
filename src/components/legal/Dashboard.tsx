import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const Dashboard = () => {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [timeEntry, setTimeEntry] = useState({ client: "", task: "", hours: "", rate: "" });

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reviewed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "flagged": return <AlertTriangle className="h-4 w-4 text-destructive" />;
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
            <Button variant="legal" size="sm">
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
                  <p className="text-sm text-muted-foreground">Active Contracts</p>
                  <p className="text-2xl font-bold">{mockContracts.length}</p>
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

        {/* Contracts Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-legal-purple" />
              Contract Dashboard
            </CardTitle>
            <CardDescription>
              All uploaded contracts with AI analysis and notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedContract(selectedContract === contract.id ? null : contract.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(contract.status)}
                      <div>
                        <h4 className="font-medium">{contract.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {contract.uploadDate} • Deadline: {contract.deadline}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(contract.riskLevel)}>
                        {contract.riskLevel} risk
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedContract === contract.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Parties</h5>
                        <div className="flex gap-2">
                          {contract.parties.map((party, index) => (
                            <Badge key={index} variant="outline">{party}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Notes</h5>
                        <p className="text-sm text-muted-foreground mb-2">{contract.notes}</p>
                        <Textarea
                          placeholder="Add a note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="mb-2"
                        />
                        <Button variant="legal-outline" size="sm">
                          Add Note
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
    </div>
  );
};