import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Lightbulb, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Copy,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { ClauseLibraryManager } from './ClauseLibraryManager';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { ClauseTemplate, ClauseSuggestion } from '@/types/clause-library';

export function ClauseLibraryDemo() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClause, setSelectedClause] = useState<string>('');

  // Sample clause for demonstration
  const sampleClause = `The Processor shall process Personal Data only on documented instructions from the Controller, including with regard to transfers of Personal Data to a third country or an international organisation, unless required to do so by Union or Member State law to which the Processor is subject.`;

  const sampleSuggestions: ClauseSuggestion[] = [
    {
      id: 'suggestion-1',
      originalClause: sampleClause,
      suggestedClause: `The Processor shall process Personal Data solely in accordance with documented instructions from the Controller, including specific provisions for transfers of Personal Data to third countries or international organisations, except where such processing is mandated by applicable Union or Member State law.`,
      suggestionType: 'CLARITY',
      title: 'Improve Clarity and Readability',
      description: 'Enhanced language structure and clearer terminology',
      reasoning: 'The suggested version uses more precise legal language and better sentence structure to improve clarity and reduce ambiguity.',
      benefits: [
        'Improved readability',
        'Reduced ambiguity',
        'Better legal precision',
        'Enhanced enforceability'
      ],
      risks: [
        'May require legal review',
        'Could affect existing agreements'
      ],
      complianceImprovements: ['GDPR'],
      confidence: 0.85,
      source: 'AI_ANALYSIS',
      suggestedBy: 'AI Clause Analyzer',
      createdAt: new Date(),
      isAccepted: false
    },
    {
      id: 'suggestion-2',
      originalClause: sampleClause,
      suggestedClause: `The Processor shall process Personal Data only on documented instructions from the Controller, including with regard to transfers of Personal Data to a third country or an international organisation, unless required to do so by Union or Member State law to which the Processor is subject. The Processor shall implement appropriate technical and organisational measures to ensure the security of Personal Data processing.`,
      suggestionType: 'COMPLIANCE',
      title: 'Enhance GDPR Compliance',
      description: 'Added security requirements for better GDPR compliance',
      reasoning: 'The suggested version includes explicit security measures required under GDPR Article 32, strengthening compliance posture.',
      benefits: [
        'Better GDPR compliance',
        'Explicit security requirements',
        'Reduced regulatory risk',
        'Audit-friendly language'
      ],
      risks: [
        'May increase complexity',
        'Requires ongoing monitoring'
      ],
      complianceImprovements: ['GDPR'],
      confidence: 0.92,
      source: 'LEGAL_PRECEDENT',
      suggestedBy: 'GDPR Compliance Engine',
      createdAt: new Date(),
      isAccepted: false
    }
  ];

  const handleClauseSelect = (clause: ClauseTemplate) => {
    console.log('Selected clause:', clause);
    setShowLibrary(false);
  };

  const handleAcceptSuggestion = (suggestion: ClauseSuggestion) => {
    console.log('Accepted suggestion:', suggestion);
    setShowSuggestions(false);
  };

  const handleRejectSuggestion = (suggestion: ClauseSuggestion) => {
    console.log('Rejected suggestion:', suggestion);
  };

  const handleViewComparison = (comparison: any) => {
    console.log('View comparison:', comparison);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clause Library & Smart Suggestions</h1>
          <p className="text-muted-foreground">
            Build, manage, and reuse legal clauses with AI-powered suggestions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowLibrary(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Open Clause Library
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedClause(sampleClause);
              setShowSuggestions(true);
            }}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Try Smart Suggestions
          </Button>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Clause Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Build and organize clause templates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Search and filter by category, risk level
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Version control and approval workflows
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Usage analytics and performance tracking
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                AI-powered alternative phrasing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Compliance and risk improvements
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Side-by-side clause comparison
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Confidence scoring and reasoning
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Integration Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Seamless contract review integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Real-time clause suggestions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Automated compliance checking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Team collaboration features
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sample Clause and Suggestions */}
      <Tabs defaultValue="clause" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clause">Sample Clause</TabsTrigger>
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison View</TabsTrigger>
        </TabsList>

        <TabsContent value="clause">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Data Protection Clause
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-mono leading-relaxed">
                    {sampleClause}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GDPR</Badge>
                  <Badge variant="outline">Data Protection</Badge>
                  <Badge variant="outline">Medium Risk</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedClause(sampleClause);
                      setShowSuggestions(true);
                    }}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Get Suggestions
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Clause
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="space-y-4">
            {sampleSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          {suggestion.title}
                        </h4>
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
                        <h5 className="text-sm font-medium mb-1">Reasoning:</h5>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.reasoning}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <h5 className="text-sm font-medium mb-2">Suggested Clause:</h5>
                        <p className="text-sm font-mono line-clamp-3">
                          {suggestion.suggestedClause}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Compare
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Clause Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Original Clause</h4>
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-sm font-mono">{sampleClause}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Improved Clause</h4>
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm font-mono">{sampleSuggestions[0].suggestedClause}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Overall Improvement Score: 85%</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Key Improvements:</h5>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Enhanced legal precision</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Improved readability</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Better compliance alignment</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-600 mb-2">Considerations:</h5>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Requires legal review</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>May affect existing agreements</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClauseLibraryManager
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelectClause={handleClauseSelect}
      />

      {showSuggestions && selectedClause && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Suggestions
              </h2>
              <Button variant="ghost" onClick={() => setShowSuggestions(false)}>
                ×
              </Button>
            </div>
            <SmartSuggestionsPanel
              originalClause={selectedClause}
              clauseContext="Contract Review"
              category="DATA_PROTECTION"
              riskLevel="HIGH"
              complianceFrameworks={['GDPR']}
              jurisdiction="EU"
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
              onViewComparison={handleViewComparison}
            />
          </div>
        </div>
      )}
    </div>
  );
}
