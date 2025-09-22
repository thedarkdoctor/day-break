import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  FileText,
  Users,
  Calendar,
  Download,
  Eye,
  Activity
} from 'lucide-react';
import { 
  RiskAnalytics, 
  Contract, 
  RiskLevel,
  ContractType,
  AnalyticsFilter 
} from '@/types/analytics';
import { AnalyticsEngine } from '@/lib/analytics-engine';

interface RiskAnalyticsProps {
  onViewContractDetails?: (contractId: string) => void;
  onViewClientDetails?: (clientId: string) => void;
  onExportReport?: () => void;
}

export function RiskAnalyticsComponent({ 
  onViewContractDetails, 
  onViewClientDetails, 
  onExportReport 
}: RiskAnalyticsProps) {
  const [engine] = useState(() => new AnalyticsEngine());
  const [riskAnalytics, setRiskAnalytics] = useState<RiskAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });
  const [selectedView, setSelectedView] = useState<'overview' | 'by-contract' | 'by-client' | 'trends'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRiskAnalytics();
  }, [selectedPeriod, dateRange]);

  const loadRiskAnalytics = async () => {
    setIsLoading(true);
    try {
      const analytics = engine.calculateRiskAnalytics(dateRange.start, dateRange.end);
      setRiskAnalytics(analytics);
    } catch (error) {
      console.error('Error loading risk analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Target className="h-4 w-4" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getContractTypeName = (type: ContractType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRiskTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DETERIORATING':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskTrendColor = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return 'text-green-600';
      case 'DETERIORATING':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateOverallRiskScore = () => {
    if (!riskAnalytics) return 0;
    
    const weights = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const total = Object.values(riskAnalytics.riskDistribution).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return 0;
    
    const weightedSum = Object.entries(riskAnalytics.riskDistribution)
      .reduce((sum, [level, count]) => sum + (weights[level as RiskLevel] * count), 0);
    
    return (weightedSum / total) * 25; // Scale to 0-100
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading risk analytics...</span>
        </div>
      </div>
    );
  }

  if (!riskAnalytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Unable to load risk analytics data.</p>
      </div>
    );
  }

  const overallRiskScore = calculateOverallRiskScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Risk Analytics</h1>
          <p className="text-muted-foreground">
            Monitor risk levels over time by contract and client
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{riskAnalytics.totalContracts}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Risk Score</p>
                <p className={`text-2xl font-bold ${
                  overallRiskScore < 30 ? 'text-green-600' :
                  overallRiskScore < 60 ? 'text-yellow-600' :
                  overallRiskScore < 80 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {overallRiskScore.toFixed(0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Risks</p>
                <p className="text-2xl font-bold text-red-600">
                  {riskAnalytics.riskDistribution.CRITICAL}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mitigation Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {riskAnalytics.riskMitigation.mitigationEffectiveness}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-contract">By Contract Type</TabsTrigger>
          <TabsTrigger value="by-client">By Client</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(riskAnalytics.riskDistribution).map(([level, count]) => {
                    const percentage = (count / riskAnalytics.totalContracts) * 100;
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskColor(level as RiskLevel)}>
                              {getRiskIcon(level as RiskLevel)}
                              <span className="ml-1">{level}</span>
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{count}</p>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              level === 'LOW' ? 'bg-green-500' :
                              level === 'MEDIUM' ? 'bg-yellow-500' :
                              level === 'HIGH' ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Risk Mitigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Risk Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contracts with Mitigation</span>
                    <span className="text-sm font-bold">
                      {riskAnalytics.riskMitigation.contractsWithMitigation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mitigation Effectiveness</span>
                    <span className="text-sm font-bold text-green-600">
                      {riskAnalytics.riskMitigation.mitigationEffectiveness}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Common Risk Factors</p>
                    <div className="flex flex-wrap gap-1">
                      {riskAnalytics.riskMitigation.commonRiskFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Actions</p>
                    <ul className="text-xs space-y-1">
                      {riskAnalytics.riskMitigation.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Risk by Contract Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Type</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Low</TableHead>
                    <TableHead className="text-right">Medium</TableHead>
                    <TableHead className="text-right">High</TableHead>
                    <TableHead className="text-right">Critical</TableHead>
                    <TableHead className="text-right">Avg Risk Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(riskAnalytics.riskByContractType).map(([type, data]) => (
                    <TableRow key={type}>
                      <TableCell className="font-medium">
                        {getContractTypeName(type as ContractType)}
                      </TableCell>
                      <TableCell className="text-right">{data.total}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-green-600">
                          {data.riskDistribution.LOW}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-yellow-600">
                          {data.riskDistribution.MEDIUM}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-orange-600">
                          {data.riskDistribution.HIGH}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-red-600">
                          {data.riskDistribution.CRITICAL}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          data.averageRiskScore < 30 ? 'text-green-600 bg-green-50' :
                          data.averageRiskScore < 60 ? 'text-yellow-600 bg-yellow-50' :
                          data.averageRiskScore < 80 ? 'text-orange-600 bg-orange-50' :
                          'text-red-600 bg-red-50'
                        }>
                          {data.averageRiskScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewContractDetails?.(type)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Risk by Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Total Contracts</TableHead>
                    <TableHead className="text-right">Low</TableHead>
                    <TableHead className="text-right">Medium</TableHead>
                    <TableHead className="text-right">High</TableHead>
                    <TableHead className="text-right">Critical</TableHead>
                    <TableHead className="text-right">Avg Risk Score</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(riskAnalytics.riskByClient).map(([clientId, data]) => (
                    <TableRow key={clientId}>
                      <TableCell className="font-medium">Client {clientId}</TableCell>
                      <TableCell className="text-right">{data.totalContracts}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-green-600">
                          {data.riskDistribution.LOW}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-yellow-600">
                          {data.riskDistribution.MEDIUM}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-orange-600">
                          {data.riskDistribution.HIGH}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-red-600">
                          {data.riskDistribution.CRITICAL}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          data.averageRiskScore < 30 ? 'text-green-600 bg-green-50' :
                          data.averageRiskScore < 60 ? 'text-yellow-600 bg-yellow-50' :
                          data.averageRiskScore < 80 ? 'text-orange-600 bg-orange-50' :
                          'text-red-600 bg-red-50'
                        }>
                          {data.averageRiskScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center gap-1 ${getRiskTrendColor(data.riskTrend)}`}>
                          {getRiskTrendIcon(data.riskTrend)}
                          <span className="text-xs">{data.riskTrend}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewClientDetails?.(clientId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Risk Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Risk trend chart would be displayed here</p>
                  <p className="text-sm">Showing risk level changes over the selected period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RiskAnalyticsComponent;
