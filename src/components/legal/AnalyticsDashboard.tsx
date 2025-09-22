import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  Activity,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  DashboardMetrics, 
  KPI, 
  ChartData, 
  AnalyticsFilter,
  TimePeriod,
  ContractType,
  RiskLevel
} from '@/types/analytics';
import { AnalyticsEngine } from '@/lib/analytics-engine';

interface AnalyticsDashboardProps {
  onViewDetails?: (type: string, id: string) => void;
  onExportReport?: (type: string) => void;
}

export function AnalyticsDashboard({ onViewDetails, onExportReport }: AnalyticsDashboardProps) {
  const [engine] = useState(() => new AnalyticsEngine());
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('MONTHLY');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date()
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, filters]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const newMetrics = engine.generateDashboardMetrics(
        filters.dateRange.start,
        filters.dateRange.end,
        filters
      );
      const newKpis = engine.generateKPIs(
        filters.dateRange.start,
        filters.dateRange.end,
        filters
      );
      
      setMetrics(newMetrics);
      setKpis(newKpis);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'DAILY':
        start.setDate(start.getDate() - 1);
        break;
      case 'WEEKLY':
        start.setDate(start.getDate() - 7);
        break;
      case 'MONTHLY':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'QUARTERLY':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'YEARLY':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    setDateRange({ start, end });
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  const getKpiIcon = (category: string) => {
    switch (category) {
      case 'REVENUE':
        return <DollarSign className="h-4 w-4" />;
      case 'PROFITABILITY':
        return <TrendingUp className="h-4 w-4" />;
      case 'TIME':
        return <Clock className="h-4 w-4" />;
      case 'RISK':
        return <Shield className="h-4 w-4" />;
      case 'CLIENTS':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getKpiColor = (trend: string) => {
    switch (trend) {
      case 'UP':
        return 'text-green-600';
      case 'DOWN':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'ERROR':
        return 'border-red-200 bg-red-50';
      case 'WARNING':
        return 'border-yellow-200 bg-yellow-50';
      case 'INFO':
        return 'border-blue-200 bg-blue-50';
      case 'SUCCESS':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Unable to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track profitability, time, and risk across your legal practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
                  <p className="text-2xl font-bold">{kpi.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getKpiIcon(kpi.category)}
                    <span className={`text-sm ${getKpiColor(kpi.trend)}`}>
                      {kpi.changePercentage > 0 ? '+' : ''}{kpi.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {kpi.trend === 'UP' ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : kpi.trend === 'DOWN' ? (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  ) : (
                    <Activity className="h-8 w-8 text-gray-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      {alert.actionable && (
                        <Button size="sm" variant="outline">
                          {alert.actionText || 'Take Action'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Revenue chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Client Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Client distribution chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">{metrics.overview.totalClients}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                    <p className="text-2xl font-bold">{metrics.overview.activeContracts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{metrics.overview.totalHours.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Client Profitability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {metrics.profitability.map((profit) => (
                    <div key={profit.clientId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Client {profit.clientId}</h4>
                        <Badge 
                          variant={profit.grossProfitMargin > 20 ? 'default' : 
                                  profit.grossProfitMargin > 10 ? 'secondary' : 'destructive'}
                        >
                          {profit.grossProfitMargin.toFixed(1)}% Margin
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Revenue</p>
                          <p className="font-medium">${profit.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Gross Profit</p>
                          <p className="font-medium">${profit.grossProfit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Billable Hours</p>
                          <p className="font-medium">{profit.billableHours.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Rate</p>
                          <p className="font-medium">${profit.averageHourlyRate.toFixed(0)}/h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Billable Hours</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${metrics.timeTracking.billablePercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {metrics.timeTracking.billablePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Non-Billable Hours</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${100 - metrics.timeTracking.billablePercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {(100 - metrics.timeTracking.billablePercentage).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Hours by Contract Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.timeTracking.hoursByContractType).map(([type, hours]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type.replace('_', ' ')}</span>
                      <span className="text-sm text-muted-foreground">{hours.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.riskAnalysis.riskDistribution).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          level === 'LOW' ? 'bg-green-500' :
                          level === 'MEDIUM' ? 'bg-yellow-500' :
                          level === 'HIGH' ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">{level.toLowerCase()}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count} contracts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                    <span className="text-sm text-muted-foreground">
                      {metrics.riskAnalysis.riskMitigation.contractsWithMitigation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mitigation Effectiveness</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.riskAnalysis.riskMitigation.mitigationEffectiveness}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Common Risk Factors</p>
                    <div className="flex flex-wrap gap-1">
                      {metrics.riskAnalysis.riskMitigation.commonRiskFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue Growth</p>
                    <p className={`text-2xl font-bold ${
                      metrics.trends.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.trends.revenueGrowth > 0 ? '+' : ''}{metrics.trends.revenueGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client Growth</p>
                    <p className={`text-2xl font-bold ${
                      metrics.trends.clientGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.trends.clientGrowth > 0 ? '+' : ''}{metrics.trends.clientGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contract Growth</p>
                    <p className={`text-2xl font-bold ${
                      metrics.trends.contractGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.trends.contractGrowth > 0 ? '+' : ''}{metrics.trends.contractGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Improvement</p>
                    <p className={`text-2xl font-bold ${
                      metrics.trends.riskImprovement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.trends.riskImprovement > 0 ? '+' : ''}{metrics.trends.riskImprovement.toFixed(1)}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
