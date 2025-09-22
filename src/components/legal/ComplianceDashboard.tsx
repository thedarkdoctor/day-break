import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  FileText, 
  TrendingUp, 
  Filter,
  Download,
  Settings,
  Eye,
  AlertCircle,
  Clock,
  Users,
  Globe
} from 'lucide-react';
import { 
  ContractComplianceAnalysis, 
  ComplianceFramework, 
  RiskLevel,
  ComplianceViolation 
} from '@/types/compliance';
import { ComplianceAnalyzer } from '@/lib/compliance-analyzer';

interface ComplianceDashboardProps {
  contracts: ContractComplianceAnalysis[];
  onViewContract: (contractId: string) => void;
  onConfigureFrameworks: () => void;
}

export function ComplianceDashboard({ 
  contracts, 
  onViewContract, 
  onConfigureFrameworks 
}: ComplianceDashboardProps) {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | 'ALL'>('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'risk' | 'date' | 'name'>('score');
  const [analyzer] = useState(() => new ComplianceAnalyzer());

  // Filter and sort contracts
  const filteredContracts = contracts
    .filter(contract => {
      if (selectedFramework !== 'ALL' && !contract.frameworks.some(f => f.framework === selectedFramework)) {
        return false;
      }
      if (selectedRiskLevel !== 'ALL' && contract.overallRiskLevel !== selectedRiskLevel) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.overallComplianceScore - a.overallComplianceScore;
        case 'risk':
          const riskOrder = { 'LOW': 4, 'MEDIUM': 3, 'HIGH': 2, 'CRITICAL': 1 };
          return riskOrder[b.overallRiskLevel] - riskOrder[a.overallRiskLevel];
        case 'date':
          return new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime();
        case 'name':
          return a.documentName.localeCompare(b.documentName);
        default:
          return 0;
      }
    });

  // Calculate dashboard statistics
  const stats = {
    totalContracts: contracts.length,
    compliantContracts: contracts.filter(c => c.overallRiskLevel === 'LOW').length,
    highRiskContracts: contracts.filter(c => c.overallRiskLevel === 'HIGH' || c.overallRiskLevel === 'CRITICAL').length,
    averageScore: contracts.length > 0 ? Math.round(contracts.reduce((sum, c) => sum + c.overallComplianceScore, 0) / contracts.length) : 0,
    criticalIssues: contracts.reduce((sum, c) => sum + c.criticalIssues.length, 0),
    frameworks: [...new Set(contracts.flatMap(c => c.frameworks.map(f => f.framework)))]
  };

  const getRiskColor = (riskLevel: RiskLevel) => {
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

  const getRiskIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'LOW':
        return <CheckCircle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Shield className="h-4 w-4" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFrameworkColor = (framework: ComplianceFramework) => {
    const colors = {
      'GDPR': 'bg-blue-100 text-blue-800',
      'HIPAA': 'bg-green-100 text-green-800',
      'SOX': 'bg-purple-100 text-purple-800',
      'CCPA': 'bg-orange-100 text-orange-800',
      'PIPEDA': 'bg-indigo-100 text-indigo-800',
      'LGPD': 'bg-pink-100 text-pink-800',
      'ISO27001': 'bg-gray-100 text-gray-800',
      'SOC2': 'bg-cyan-100 text-cyan-800',
      'PCI-DSS': 'bg-red-100 text-red-800',
      'CUSTOM': 'bg-yellow-100 text-yellow-800'
    };
    return colors[framework] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor contract compliance across multiple frameworks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onConfigureFrameworks}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{stats.totalContracts}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{stats.compliantContracts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskContracts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value as ComplianceFramework | 'ALL')}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">All Frameworks</option>
              {stats.frameworks.map(framework => (
                <option key={framework} value={framework}>{framework}</option>
              ))}
            </select>

            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value as RiskLevel | 'ALL')}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="score">Sort by Score</option>
              <option value="risk">Sort by Risk</option>
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.contractId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-2">{contract.documentName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(contract.overallRiskLevel)}>
                          {getRiskIcon(contract.overallRiskLevel)}
                          <span className="ml-1">{contract.overallRiskLevel}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {contract.overallComplianceScore}%
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewContract(contract.contractId)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Frameworks */}
                    <div className="flex flex-wrap gap-1">
                      {contract.frameworks.map((framework) => (
                        <Badge
                          key={framework.framework}
                          variant="secondary"
                          className={`text-xs ${getFrameworkColor(framework.framework)}`}
                        >
                          {framework.framework}
                        </Badge>
                      ))}
                    </div>

                    {/* Auto Tags */}
                    {contract.autoTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contract.autoTags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contract.autoTags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{contract.autoTags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Issues Summary */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {contract.criticalIssues.length > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {contract.criticalIssues.length} critical
                        </span>
                      )}
                      {contract.mediumIssues.length > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          {contract.mediumIssues.length} high
                        </span>
                      )}
                      {contract.lowIssues.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Shield className="h-3 w-3" />
                          {contract.lowIssues.length} medium
                        </span>
                      )}
                    </div>

                    {/* Analysis Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Analyzed {new Date(contract.analyzedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <Card key={contract.contractId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{contract.documentName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(contract.overallRiskLevel)}>
                          {getRiskIcon(contract.overallRiskLevel)}
                          <span className="ml-1">{contract.overallRiskLevel}</span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewContract(contract.contractId)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contract.frameworks.map((framework) => (
                        <div key={framework.framework} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{framework.framework}</span>
                            <Badge variant="outline">{framework.overallScore}%</Badge>
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
                          <div className="text-sm text-muted-foreground">
                            {framework.violations.length} violations
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="violations">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredContracts
                .filter(contract => 
                  contract.criticalIssues.length > 0 || 
                  contract.mediumIssues.length > 0 || 
                  contract.lowIssues.length > 0
                )
                .map((contract) => (
                <Card key={contract.contractId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{contract.documentName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Critical Issues */}
                      {contract.criticalIssues.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Critical Issues ({contract.criticalIssues.length})
                          </h4>
                          <div className="space-y-2">
                            {contract.criticalIssues.map((violation, index) => (
                              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="font-medium text-sm">{violation.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {violation.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* High Risk Issues */}
                      {contract.mediumIssues.length > 0 && (
                        <div>
                          <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            High Risk Issues ({contract.mediumIssues.length})
                          </h4>
                          <div className="space-y-2">
                            {contract.mediumIssues.map((violation, index) => (
                              <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                <div className="font-medium text-sm">{violation.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {violation.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medium Risk Issues */}
                      {contract.lowIssues.length > 0 && (
                        <div>
                          <h4 className="font-medium text-amber-600 mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Medium Risk Issues ({contract.lowIssues.length})
                          </h4>
                          <div className="space-y-2">
                            {contract.lowIssues.map((violation, index) => (
                              <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                <div className="font-medium text-sm">{violation.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {violation.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
