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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, CheckCircle, FileText, Download, Upload, Settings, Globe, BookOpen, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ComplianceAnalyzer } from "@/lib/compliance-analyzer";
import { ContractComplianceAnalysis, ComplianceFramework } from "@/types/compliance";
import { ClauseLibraryManager } from './ClauseLibraryManager';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { ClauseTemplate, ClauseSuggestion, ClauseComparison } from '@/types/clause-library';

interface ContractReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAnalysis?: ContractAnalysis | null;
  initialExecutiveSummary?: string;
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

export function ContractReviewModal({ open, onOpenChange, initialAnalysis, initialExecutiveSummary }: ContractReviewModalProps) {
  const { user } = useAuth();
  const [contractText, setContractText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(initialAnalysis || null);
  const [executiveSummary, setExecutiveSummary] = useState(initialExecutiveSummary || "");
  const [complianceAnalysis, setComplianceAnalysis] = useState<ContractComplianceAnalysis | null>(null);
  const [selectedFrameworks, setSelectedFrameworks] = useState<ComplianceFramework[]>(['GDPR', 'HIPAA', 'SOX']);
  const [jurisdiction, setJurisdiction] = useState('US');
  const [analyzer] = useState(() => new ComplianceAnalyzer());
  const [showClauseLibrary, setShowClauseLibrary] = useState(false);
  const [selectedClauseForSuggestions, setSelectedClauseForSuggestions] = useState<string | null>(null);
  const [clauseSuggestions, setClauseSuggestions] = useState<ClauseSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
        
        // Run compliance analysis
        const compliance = analyzer.analyzeContract(
          contractText,
          documentName,
          selectedFrameworks,
          jurisdiction
        );
        setComplianceAnalysis(compliance);
        
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
    setAnalysis(initialAnalysis || null);
    setExecutiveSummary(initialExecutiveSummary || "");
    setComplianceAnalysis(null);
    setClauseSuggestions([]);
    setShowSuggestions(false);
    setSelectedClauseForSuggestions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClauseSelect = (clause: ClauseTemplate) => {
    // Insert clause into contract text
    const newText = contractText + '\n\n' + clause.content;
    setContractText(newText);
    setShowClauseLibrary(false);
    toast.success(`Added clause: ${clause.title}`);
  };

  const handleGenerateSuggestions = (clauseText: string, context: string) => {
    setSelectedClauseForSuggestions(clauseText);
    setShowSuggestions(true);
  };

  const handleAcceptSuggestion = (suggestion: ClauseSuggestion) => {
    // Replace the original clause with the suggested one
    if (selectedClauseForSuggestions) {
      const newText = contractText.replace(selectedClauseForSuggestions, suggestion.suggestedClause);
      setContractText(newText);
      toast.success('Clause updated with suggestion');
    }
    setShowSuggestions(false);
    setSelectedClauseForSuggestions(null);
  };

  const handleRejectSuggestion = (suggestion: ClauseSuggestion) => {
    toast.info('Suggestion rejected');
  };

  const handleViewComparison = (comparison: ClauseComparison) => {
    // Handle comparison view - could open a modal or show details
    console.log('Comparison:', comparison);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-5 w-5 text-legal-purple" />
            AI Contract Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 flex-1 min-h-0">
          {!analysis ? (
            // Input Form
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
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

              {/* Compliance Framework Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Compliance Frameworks</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(['GDPR', 'HIPAA', 'SOX', 'CCPA', 'ISO27001', 'SOC2'] as ComplianceFramework[]).map((framework) => (
                      <div
                        key={framework}
                        className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                          selectedFrameworks.includes(framework)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (selectedFrameworks.includes(framework)) {
                            setSelectedFrameworks(prev => prev.filter(f => f !== framework));
                          } else {
                            setSelectedFrameworks(prev => [...prev, framework]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFrameworks.includes(framework)}
                            onChange={() => {}}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">{framework}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                    <select
                      id="jurisdiction"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="US">United States</option>
                      <option value="EU">European Union</option>
                      <option value="CA">Canada</option>
                      <option value="BR">Brazil</option>
                      <option value="AU">Australia</option>
                      <option value="UK">United Kingdom</option>
                      <option value="GLOBAL">Global</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowClauseLibrary(true)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Clause Library
                  </Button>
                </div>
                <Button 
                  onClick={handleAnalysis} 
                  disabled={isAnalyzing || !contractText.trim()}
                  className="bg-legal-purple hover:bg-legal-purple/90"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Contract"}
                </Button>
              </div>
              </div>
            </ScrollArea>
          ) : (
            // Analysis Results
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportAnalysis} className="flex-1 sm:flex-none">
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetForm} className="flex-1 sm:flex-none">
                      <span className="hidden sm:inline">New Analysis</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </div>
                </div>

                {/* Compliance Analysis Tabs */}
                <Tabs defaultValue="overview" className="w-full flex-1 min-h-0 flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-6 pr-4">

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <Card className={`${getRiskColor(analysis.overall_risk_level)} border`}>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        {getRiskIcon(analysis.overall_risk_level)}
                      </div>
                      <div className="text-lg sm:text-2xl font-bold">
                        {analysis.overall_risk_level.toUpperCase()}
                      </div>
                      <div className="text-xs sm:text-sm">Overall Risk</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl font-bold text-red-600">
                        {analysis.summary.red_clauses}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">High Risk</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl font-bold text-amber-600">
                        {analysis.summary.yellow_clauses}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Medium Risk</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {analysis.summary.green_clauses}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Low Risk</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-md">
                      {executiveSummary}
                    </pre>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                            <span className="text-xs sm:text-sm break-words">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Flags */}
                {analysis.compliance_flags && analysis.compliance_flags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        Compliance Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.compliance_flags.map((flag, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                            <span className="text-xs sm:text-sm break-words">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Clause Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Clause Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.clauses
                        .filter(clause => clause.risk_level !== 'green')
                        .map((clause, index) => (
                        <div key={index} className="space-y-3 p-3 sm:p-4 border rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getRiskColor(clause.risk_level)}`}>
                              {getRiskIcon(clause.risk_level)}
                              <span className="ml-1 text-xs sm:text-sm">
                                {clause.clause_type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Risk Score: {clause.risk_score.toFixed(2)}
                            </span>
                          </div>
                          
                          {clause.text && (
                            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                              <strong>Clause Text:</strong> {clause.text}
                            </div>
                          )}
                          
                          {clause.issues.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm text-red-600 mb-2">Issues Identified:</h5>
                              <ul className="text-xs sm:text-sm space-y-1">
                                {clause.issues.map((issue, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                                    <span className="break-words">{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {clause.suggestions.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm text-green-600 mb-2">Suggestions:</h5>
                              <ul className="text-xs sm:text-sm space-y-1">
                                {clause.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                                    <span className="break-words">{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {index < analysis.clauses.filter(c => c.risk_level !== 'green').length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="compliance" className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-6 pr-4">
                    {complianceAnalysis ? (
                      <>
                        {/* Compliance Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className={`${getRiskColor(complianceAnalysis.overallRiskLevel)} border`}>
                            <CardContent className="p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                {getRiskIcon(complianceAnalysis.overallRiskLevel)}
                              </div>
                              <div className="text-2xl font-bold">
                                {complianceAnalysis.overallRiskLevel}
                              </div>
                              <div className="text-sm">Overall Risk</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {complianceAnalysis.overallComplianceScore}%
                              </div>
                              <div className="text-sm text-muted-foreground">Compliance Score</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {complianceAnalysis.criticalIssues.length}
                              </div>
                              <div className="text-sm text-muted-foreground">Critical Issues</div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Framework Scores */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Globe className="h-5 w-5" />
                              Framework Compliance Scores
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {complianceAnalysis.frameworks.map((framework) => (
                                <div key={framework.framework} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{framework.framework}</span>
                                    <div className="flex items-center gap-2">
                                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getRiskColor(framework.riskLevel)}`}>
                                        {getRiskIcon(framework.riskLevel)}
                                        <span className="ml-1">{framework.riskLevel}</span>
                                      </div>
                                      <span className="text-sm font-medium">{framework.overallScore}%</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        framework.overallScore >= 80 ? 'bg-green-500' :
                                        framework.overallScore >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${framework.overallScore}%` }}
                                    />
                                  </div>
                                  {framework.violations.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                      {framework.violations.length} violations found
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Auto Tags */}
                        {complianceAnalysis.autoTags.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Auto-Generated Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {complianceAnalysis.autoTags.map((tag, index) => (
                                  <div key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors text-foreground">
                                    {tag}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Critical Issues */}
                        {complianceAnalysis.criticalIssues.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Critical Compliance Issues
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {complianceAnalysis.criticalIssues.map((violation, index) => (
                                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <div className="font-medium text-sm">{violation.description}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {violation.explanation}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2">
                                      Suggested Action: {violation.suggestedAction}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No compliance analysis available. Run the analysis to see compliance results.
                      </div>
                    )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="detailed" className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-6 pr-4">
                    {/* Original detailed analysis content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Executive Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Executive Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-md">
                            {executiveSummary}
                          </pre>
                        </CardContent>
                      </Card>

                      {/* Detailed Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Clause Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {analysis.clauses
                              .filter(clause => clause.risk_level !== 'green')
                              .map((clause, index) => (
                              <div key={index} className="space-y-3 p-4 border rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getRiskColor(clause.risk_level)}`}>
                                    {getRiskIcon(clause.risk_level)}
                                    <span className="ml-1 text-xs sm:text-sm">
                                      {clause.clause_type.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                      Risk Score: {clause.risk_score.toFixed(2)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerateSuggestions(clause.text, `Clause: ${clause.clause_type}`)}
                                      className="h-6 px-2"
                                    >
                                      <Lightbulb className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {clause.text && (
                                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                                    <strong>Clause Text:</strong> {clause.text}
                                  </div>
                                )}
                                
                                {clause.issues.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm text-red-600 mb-2">Issues Identified:</h5>
                                    <ul className="text-xs sm:text-sm space-y-1">
                                      {clause.issues.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                                          <span className="break-words">{issue}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {clause.suggestions.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm text-green-600 mb-2">Suggestions:</h5>
                                    <ul className="text-xs sm:text-sm space-y-1">
                                      {clause.suggestions.map((suggestion, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                                          <span className="break-words">{suggestion}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {index < analysis.clauses.filter(c => c.risk_level !== 'green').length - 1 && (
                                  <Separator className="my-4" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Clause Library Modal */}
      <ClauseLibraryManager
        open={showClauseLibrary}
        onOpenChange={setShowClauseLibrary}
        onSelectClause={handleClauseSelect}
      />

      {/* Smart Suggestions Modal */}
      {showSuggestions && selectedClauseForSuggestions && (
        <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Suggestions
              </DialogTitle>
            </DialogHeader>
            <SmartSuggestionsPanel
              originalClause={selectedClauseForSuggestions}
              clauseContext="Contract Review"
              category="DATA_PROTECTION"
              riskLevel="HIGH"
              complianceFrameworks={selectedFrameworks}
              jurisdiction={jurisdiction}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
              onViewComparison={handleViewComparison}
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}