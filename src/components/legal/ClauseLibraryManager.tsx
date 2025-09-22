import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Download,
  Upload,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle,
  Shield,
  FileText
} from 'lucide-react';
import { 
  ClauseTemplate, 
  ClauseLibrary, 
  ClauseSearchFilters, 
  ClauseCategory,
  ClauseStatus,
  ClauseSuggestion,
  SmartSuggestionRequest
} from '@/types/clause-library';
import { ClauseLibraryEngine } from '@/lib/clause-library-engine';

interface ClauseLibraryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectClause?: (clause: ClauseTemplate) => void;
  onGenerateSuggestions?: (request: SmartSuggestionRequest) => void;
}

export function ClauseLibraryManager({ 
  open, 
  onOpenChange, 
  onSelectClause,
  onGenerateSuggestions 
}: ClauseLibraryManagerProps) {
  const [engine] = useState(() => new ClauseLibraryEngine());
  const [libraries, setLibraries] = useState<ClauseLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');
  const [clauses, setClauses] = useState<ClauseTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ClauseSearchFilters>({});
  const [selectedClause, setSelectedClause] = useState<ClauseTemplate | null>(null);
  const [suggestions, setSuggestions] = useState<ClauseSuggestion[]>([]);
  const [showCreateClause, setShowCreateClause] = useState(false);

  useEffect(() => {
    // Initialize libraries
    const defaultLibrary = engine.createLibrary(
      'Default Library',
      'Standard legal clauses',
      'default',
      true
    );
    setLibraries([defaultLibrary]);
    setSelectedLibrary(defaultLibrary.id);
  }, [engine]);

  useEffect(() => {
    if (selectedLibrary) {
      const library = libraries.find(l => l.id === selectedLibrary);
      if (library) {
        const results = engine.searchClauses(selectedLibrary, searchQuery, filters);
        setClauses(results);
      }
    }
  }, [selectedLibrary, searchQuery, filters, engine, libraries]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (key: keyof ClauseSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClauseSelect = (clause: ClauseTemplate) => {
    setSelectedClause(clause);
    if (onSelectClause) {
      onSelectClause(clause);
    }
  };

  const handleGenerateSuggestions = (clause: ClauseTemplate) => {
    const request: SmartSuggestionRequest = {
      originalClause: clause.content,
      context: 'Contract review',
      category: clause.category,
      complianceFrameworks: clause.complianceFrameworks,
      jurisdiction: clause.jurisdiction,
      riskLevel: clause.riskLevel,
      desiredImprovements: ['clarity', 'compliance', 'risk_reduction'],
      maxSuggestions: 5
    };

    const newSuggestions = engine.generateSmartSuggestions(request, selectedLibrary);
    setSuggestions(newSuggestions);
    
    if (onGenerateSuggestions) {
      onGenerateSuggestions(request);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return <CheckCircle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Shield className="h-4 w-4" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ClauseStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50';
      case 'DRAFT':
        return 'text-blue-600 bg-blue-50';
      case 'DEPRECATED':
        return 'text-orange-600 bg-orange-50';
      case 'ARCHIVED':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Clause Library Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="search">Search & Filter</TabsTrigger>
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px]">
            <TabsContent value="library" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Clause Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage and organize your legal clause templates
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => setShowCreateClause(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Clause
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {clauses.map((clause) => (
                  <Card 
                    key={clause.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleClauseSelect(clause)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base line-clamp-2">{clause.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {clause.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getRiskColor(clause.riskLevel)}>
                            {getRiskIcon(clause.riskLevel)}
                            <span className="ml-1 text-xs">{clause.riskLevel}</span>
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(clause.status)}>
                            {clause.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Category and Tags */}
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {clause.category.replace('_', ' ')}
                          </Badge>
                          {clause.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {clause.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{clause.tags.length - 2}
                            </Badge>
                          )}
                        </div>

                        {/* Compliance Frameworks */}
                        {clause.complianceFrameworks.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {clause.complianceFrameworks.map((framework, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Usage Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {clause.usageCount} uses
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(clause.lastModified).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClauseSelect(clause);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateSuggestions(clause);
                            }}
                          >
                            <Lightbulb className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(clause.content);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search & Filter Clauses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-query">Search Query</Label>
                      <Input
                        id="search-query"
                        placeholder="Search clauses by title, content, or tags..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={filters.categories?.[0] || ''}
                        onValueChange={(value) => handleFilterChange('categories', value ? [value] : [])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {([
                            'DATA_PROTECTION',
                            'FINANCIAL_REPORTING',
                            'HEALTHCARE_PRIVACY',
                            'CONSUMER_RIGHTS',
                            'SECURITY_REQUIREMENTS',
                            'AUDIT_COMPLIANCE',
                            'TERMINATION_RIGHTS',
                            'LIABILITY_LIMITATION',
                            'INTELLECTUAL_PROPERTY',
                            'CONFIDENTIALITY'
                          ] as const).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Risk Level</Label>
                      <Select
                        value={filters.riskLevel?.[0] || ''}
                        onValueChange={(value) => handleFilterChange('riskLevel', value ? [value] : [])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Risk Levels</SelectItem>
                          <SelectItem value="LOW">Low Risk</SelectItem>
                          <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                          <SelectItem value="HIGH">High Risk</SelectItem>
                          <SelectItem value="CRITICAL">Critical Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={filters.status?.[0] || ''}
                        onValueChange={(value) => handleFilterChange('status', value ? [value] : [])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Jurisdiction</Label>
                      <Select
                        value={filters.jurisdiction || ''}
                        onValueChange={(value) => handleFilterChange('jurisdiction', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Jurisdictions</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="EU">European Union</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="GLOBAL">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({})}
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => {
                        // Trigger search with current filters
                        handleSearch(searchQuery);
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Smart Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No suggestions available. Select a clause to generate smart suggestions.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{suggestion.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {suggestion.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {suggestion.suggestionType.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {Math.round(suggestion.confidence * 100)}% confidence
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <Label className="text-sm font-medium">Reasoning:</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {suggestion.reasoning}
                                  </p>
                                </div>

                                {suggestion.benefits.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium text-green-600">Benefits:</Label>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {suggestion.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {suggestion.risks.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium text-red-600">Risks:</Label>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {suggestion.risks.map((risk, index) => (
                                        <li key={index}>{risk}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm">
                                  Accept Suggestion
                                </Button>
                                <Button variant="outline" size="sm">
                                  View Comparison
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Clause Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon. Track clause usage, performance, and insights.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
