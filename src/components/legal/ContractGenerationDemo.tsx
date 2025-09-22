import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Zap, 
  Users, 
  Building, 
  Target, 
  CheckCircle,
  Clock,
  Download,
  Eye,
  Settings,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';
import { ContractBuilder } from './ContractBuilder';
import { ContractTemplateManager } from './ContractTemplateManager';
import { GeneratedContract } from '@/types/contract-generation';

export function ContractGenerationDemo() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);

  const handleContractGenerated = (contract: GeneratedContract) => {
    setGeneratedContract(contract);
    setSelectedTab('generated');
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTab('builder');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Automated Contract Generation</h1>
          <p className="text-muted-foreground">
            Input terms and auto-generate standard contracts using templates with pre-filled fields
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Auto-Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Input terms → auto-generate contracts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Pre-filled fields from CRM data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Smart suggestions from past deals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Real-time validation and preview
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Template Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Standard contract templates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Customizable field definitions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Version control and approval
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Usage analytics and optimization
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              CRM Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Auto-fill client information
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Past deal analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Smart field suggestions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Context-aware generation
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sample Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sample Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">1. Select Template</h4>
              <p className="text-sm text-muted-foreground">Choose from library of contract templates</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-medium">2. Auto-Fill Fields</h4>
              <p className="text-sm text-muted-foreground">CRM data and past deals pre-fill fields</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">3. Review & Edit</h4>
              <p className="text-sm text-muted-foreground">Review generated contract and make adjustments</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">4. Generate & Export</h4>
              <p className="text-sm text-muted-foreground">Generate final contract in multiple formats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Contract Builder</TabsTrigger>
          <TabsTrigger value="generated">Generated</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Smart Auto-Fill</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically populate fields using CRM data and past deal analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Template Library</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive library of standard contract templates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Real-Time Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        See your contract as you build it with live preview
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Validation & Quality</h4>
                      <p className="text-sm text-muted-foreground">
                        Built-in validation ensures contract quality and completeness
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sample Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Service Agreement', type: 'Commercial', fields: 8, usage: 45 },
                    { name: 'Data Processing Agreement', type: 'Privacy', fields: 12, usage: 32 },
                    { name: 'Non-Disclosure Agreement', type: 'Confidentiality', fields: 6, usage: 28 },
                    { name: 'Merger Agreement', type: 'Corporate', fields: 25, usage: 15 },
                    { name: 'Employment Contract', type: 'HR', fields: 15, usage: 38 }
                  ].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground">{template.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{template.fields} fields</span>
                          <Badge variant="outline" className="text-xs">
                            {template.usage} uses
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-medium">Time Savings</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduce contract generation time by up to 80% with automated templates and pre-filled fields
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Consistency</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure consistent contract language and structure across all agreements
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Quality Assurance</h4>
                  <p className="text-sm text-muted-foreground">
                    Built-in validation and quality checks ensure contract completeness and accuracy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ContractTemplateManager onTemplateSelect={handleTemplateSelect} />
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <ContractBuilder 
            onContractGenerated={handleContractGenerated}
            initialTemplateId="template-1"
            clientId="client-1"
          />
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          {generatedContract ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Contract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Contract Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Template:</span>
                          <span>{generatedContract.templateName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Generated:</span>
                          <span>{generatedContract.metadata.generatedAt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Format:</span>
                          <span>{generatedContract.metadata.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Word Count:</span>
                          <span>{generatedContract.metadata.wordCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Status</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">{generatedContract.status}</Badge>
                        <div className="text-sm text-muted-foreground">
                          Version {generatedContract.metadata.version}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Actions</h4>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Contract Content</h4>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {generatedContract.content}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Generated Contract</h3>
              <p className="text-muted-foreground mb-4">
                Use the Contract Builder to generate your first contract
              </p>
              <Button onClick={() => setSelectedTab('builder')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Builder
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
