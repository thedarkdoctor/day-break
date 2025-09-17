import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Shield, CheckCircle, FileText, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ContractReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClauseAnalysis {
  text: string;
  start_pos: number;
  end_pos: number;
  risk_level: 'red' | 'yellow' | 'green';
  risk_score: number;
  issues: string[];
  suggestions: string[];
  clause_type: string;
  confidence: number;
  timestamp: string;
}

interface ContractAnalysis {
  document_id: string;
  clauses: ClauseAnalysis[];
  overall_risk_score: number;
  overall_risk_level: 'red' | 'yellow' | 'green';
  summary: {
    total_clauses: number;
    red_clauses: number;
    yellow_clauses: number;
    green_clauses: number;
    compliance_violations: number;
    applicable_frameworks: string[];
  };
  recommendations: string[];
  compliance_flags: string[];
}

export function ContractReviewModal({ open, onOpenChange }: ContractReviewModalProps) {
  const { user } = useAuth();
  const [contractText, setContractText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocumentName(file.name);

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContractText(text);
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a .txt file. PDF and DOCX support coming soon.");
    }
  };

  const handleAnalysis = async () => {
    if (!contractText.trim() || !documentName.trim()) {
      toast.error("Please provide both contract text and document name");
      return;
    }

    if (!user) {
      toast.error("Please log in to analyze contracts");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.access_token) {
        throw new Error("No valid session token");
      }

      const response = await supabase.functions.invoke('ai-contract-review', {
        body: {
          contract_text: contractText,
          document_name: documentName
        },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Analysis failed');
      }

      if (response.data?.analysis && response.data?.executive_summary) {
        setAnalysis(response.data.analysis);
        setExecutiveSummary(response.data.executive_summary);
        toast.success("Contract analysis completed!");
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'yellow':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'red':
        return <AlertTriangle className="h-4 w-4" />;
      case 'yellow':
        return <Shield className="h-4 w-4" />;
      case 'green':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const exportAnalysis = () => {
    if (!analysis || !executiveSummary) return;

    const exportData = {
      executive_summary: executiveSummary,
      detailed_analysis: analysis,
      export_date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysis.document_id}_analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Analysis exported successfully");
  };

  const resetForm = () => {
    setContractText("");
    setDocumentName("");
    setAnalysis(null);
    setExecutiveSummary("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-legal-purple" />
            AI Contract Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 overflow-hidden">
          {!analysis ? (
            // Input Form
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    placeholder="e.g., Service Agreement v2.1"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload Contract File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File (.txt)
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contract-text">Contract Text</Label>
                <Textarea
                  id="contract-text"
                  placeholder="Paste your contract text here or upload a file..."
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetForm}>
                  Clear
                </Button>
                <Button 
                  onClick={handleAnalysis} 
                  disabled={isAnalyzing || !contractText.trim()}
                  className="bg-legal-purple hover:bg-legal-purple/90"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Contract"}
                </Button>
              </div>
            </div>
          ) : (
            // Analysis Results
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportAnalysis}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    New Analysis
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className={`${getRiskColor(analysis.overall_risk_level)} border`}>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getRiskIcon(analysis.overall_risk_level)}
                    </div>
                    <div className="text-2xl font-bold">
                      {analysis.overall_risk_level.toUpperCase()}
                    </div>
                    <div className="text-sm">Overall Risk</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analysis.summary.red_clauses}
                    </div>
                    <div className="text-sm text-muted-foreground">High Risk</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {analysis.summary.yellow_clauses}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium Risk</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.summary.green_clauses}
                    </div>
                    <div className="text-sm text-muted-foreground">Low Risk</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* Executive Summary */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {executiveSummary}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Clause Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        {analysis.clauses
                          .filter(clause => clause.risk_level !== 'green')
                          .map((clause, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className={getRiskColor(clause.risk_level)}>
                                {getRiskIcon(clause.risk_level)}
                                <span className="ml-1">
                                  {clause.clause_type.replace('_', ' ').toUpperCase()}
                                </span>
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Risk Score: {clause.risk_score.toFixed(2)}
                              </span>
                            </div>
                            
                            {clause.issues.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-red-600 mb-1">Issues:</h5>
                                <ul className="text-xs space-y-1">
                                  {clause.issues.map((issue, i) => (
                                    <li key={i} className="text-muted-foreground">• {issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {clause.suggestions.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-green-600 mb-1">Suggestions:</h5>
                                <ul className="text-xs space-y-1">
                                  {clause.suggestions.map((suggestion, i) => (
                                    <li key={i} className="text-muted-foreground">• {suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {index < analysis.clauses.filter(c => c.risk_level !== 'green').length - 1 && (
                              <Separator className="my-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}