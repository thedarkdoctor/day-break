import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  ArrowRight,
  BookOpen,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';
import { 
  ClauseSuggestion, 
  ClauseTemplate,
  SmartSuggestionRequest,
  ClauseComparison
} from '@/types/clause-library';
import { ClauseLibraryEngine } from '@/lib/clause-library-engine';

interface SmartSuggestionsPanelProps {
  originalClause: string;
  clauseContext: string;
  category: string;
  riskLevel: string;
  complianceFrameworks: string[];
  jurisdiction: string;
  onAcceptSuggestion: (suggestion: ClauseSuggestion) => void;
  onRejectSuggestion: (suggestion: ClauseSuggestion) => void;
  onViewComparison: (comparison: ClauseComparison) => void;
}

export function SmartSuggestionsPanel({
  originalClause,
  clauseContext,
  category,
  riskLevel,
  complianceFrameworks,
  jurisdiction,
  onAcceptSuggestion,
  onRejectSuggestion,
  onViewComparison
}: SmartSuggestionsPanelProps) {
  const [engine] = useState(() => new ClauseLibraryEngine());
  const [suggestions, setSuggestions] = useState<ClauseSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ClauseSuggestion | null>(null);
  const [comparison, setComparison] = useState<ClauseComparison | null>(null);

  useEffect(() => {
    generateSuggestions();
  }, [originalClause, category, riskLevel, complianceFrameworks, jurisdiction]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    
    try {
      const request: SmartSuggestionRequest = {
        originalClause,
        context: clauseContext,
        category: category as any,
        complianceFrameworks,
        jurisdiction,
        riskLevel,
        desiredImprovements: ['clarity', 'compliance', 'risk_reduction', 'legal_strength'],
        maxSuggestions: 5
      };

      const newSuggestions = engine.generateSmartSuggestions(request, 'default');
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewComparison = (suggestion: ClauseSuggestion) => {
    const comparison = engine.compareClauses(originalClause, suggestion.suggestedClause);
    setComparison(comparison);
    setSelectedSuggestion(suggestion);
    onViewComparison(comparison);
  };

  const handleAcceptSuggestion = (suggestion: ClauseSuggestion) => {
    onAcceptSuggestion(suggestion);
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, isAccepted: true, acceptedAt: new Date() } : s)
    );
  };

  const handleRejectSuggestion = (suggestion: ClauseSuggestion) => {
    onRejectSuggestion(suggestion);
    setSuggestions(prev => 
      prev.filter(s => s.id !== suggestion.id)
    );
  };

  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case 'IMPROVEMENT':
        return <TrendingUp className="h-4 w-4" />;
      case 'COMPLIANCE':
        return <Shield className="h-4 w-4" />;
      case 'RISK_REDUCTION':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CLARITY':
        return <FileText className="h-4 w-4" />;
      case 'LEGAL_STRENGTH':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'IMPROVEMENT':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'COMPLIANCE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'RISK_REDUCTION':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CLARITY':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'LEGAL_STRENGTH':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Suggestions Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't find any suggestions for this clause. Try adjusting the context or category.
            </p>
            <Button variant="outline" onClick={generateSuggestions}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions ({suggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card 
                  key={suggestion.id} 
                  className={`border-l-4 ${
                    suggestion.isAccepted ? 'border-l-green-500 bg-green-50' : 
                    'border-l-blue-500 hover:shadow-md transition-shadow'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSuggestionTypeIcon(suggestion.suggestionType)}
                            <h4 className="font-medium">{suggestion.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSuggestionTypeColor(suggestion.suggestionType)}>
                            {suggestion.suggestionType.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={getConfidenceColor(suggestion.confidence)}
                          >
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div>
                        <h5 className="text-sm font-medium mb-1">Reasoning:</h5>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.reasoning}
                        </p>
                      </div>

                      {/* Benefits and Risks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestion.benefits.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-600 mb-1">Benefits:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {suggestion.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {suggestion.risks.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-red-600 mb-1">Risks:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {suggestion.risks.map((risk, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                  <span>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Compliance Improvements */}
                      {suggestion.complianceImprovements.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-blue-600 mb-1">Compliance Improvements:</h5>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.complianceImprovements.map((improvement, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {improvement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Clause Preview */}
                      <div className="bg-muted/50 p-3 rounded-md">
                        <h5 className="text-sm font-medium mb-2">Suggested Clause:</h5>
                        <p className="text-sm font-mono line-clamp-3">
                          {suggestion.suggestedClause}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptSuggestion(suggestion)}
                          disabled={suggestion.isAccepted}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {suggestion.isAccepted ? 'Accepted' : 'Accept'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewComparison(suggestion)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Compare
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(suggestion.suggestedClause)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectSuggestion(suggestion)}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Comparison Modal would go here */}
      {comparison && selectedSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Clause Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Original Clause</h4>
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm font-mono">{originalClause}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Suggested Clause</h4>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm font-mono">{selectedSuggestion.suggestedClause}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Overall Score: {Math.round(comparison.overallScore * 100)}%</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${comparison.overallScore * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-600 mb-2">Improvements:</h5>
                  <ul className="text-sm space-y-1">
                    {comparison.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-red-600 mb-2">Concerns:</h5>
                  <ul className="text-sm space-y-1">
                    {comparison.concerns.map((concern, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Badge 
                  variant={comparison.recommendation === 'ACCEPT' ? 'default' : 
                          comparison.recommendation === 'MODIFY' ? 'secondary' : 'destructive'}
                >
                  Recommendation: {comparison.recommendation}
                </Badge>
                <Button
                  onClick={() => {
                    setComparison(null);
                    setSelectedSuggestion(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
