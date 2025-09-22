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
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { 
  TimeAnalytics, 
  TimeEntry, 
  ContractType,
  TimeEntryType,
  AnalyticsFilter 
} from '@/types/analytics';
import { AnalyticsEngine } from '@/lib/analytics-engine';

interface TimeTrackingAnalyticsProps {
  onViewUserDetails?: (userId: string) => void;
  onViewContractDetails?: (contractId: string) => void;
  onExportReport?: () => void;
}

export function TimeTrackingAnalytics({ 
  onViewUserDetails, 
  onViewContractDetails, 
  onExportReport 
}: TimeTrackingAnalyticsProps) {
  const [engine] = useState(() => new AnalyticsEngine());
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });
  const [selectedView, setSelectedView] = useState<'overview' | 'by-user' | 'by-contract' | 'by-type'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTimeAnalytics();
  }, [selectedPeriod, dateRange]);

  const loadTimeAnalytics = async () => {
    setIsLoading(true);
    try {
      const analytics = engine.calculateTimeAnalytics(dateRange.start, dateRange.end);
      setTimeAnalytics(analytics);
    } catch (error) {
      console.error('Error loading time analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContractTypeName = (type: ContractType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTimeEntryTypeName = (type: TimeEntryType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeColor = (type: TimeEntryType) => {
    switch (type) {
      case 'BILLABLE':
        return 'text-green-600 bg-green-50';
      case 'NON_BILLABLE':
        return 'text-red-600 bg-red-50';
      case 'ADMINISTRATIVE':
        return 'text-blue-600 bg-blue-50';
      case 'TRAINING':
        return 'text-purple-600 bg-purple-50';
      case 'RESEARCH':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-4 w-4" />;
    if (percentage >= 60) return <Target className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading time analytics...</span>
        </div>
      </div>
    );
  }

  if (!timeAnalytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Unable to load time tracking data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking Analytics</h1>
          <p className="text-muted-foreground">
            Analyze billable vs non-billable hours by contract type and user
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
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
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{timeAnalytics.totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billable Hours</p>
                <p className="text-2xl font-bold">{timeAnalytics.billableHours.toFixed(1)}h</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billable %</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(timeAnalytics.billablePercentage)}`}>
                  {timeAnalytics.billablePercentage.toFixed(1)}%
                </p>
              </div>
              {getUtilizationIcon(timeAnalytics.billablePercentage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Hours/Day</p>
                <p className="text-2xl font-bold">{timeAnalytics.averageHoursPerDay.toFixed(1)}h</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-user">By User</TabsTrigger>
          <TabsTrigger value="by-contract">By Contract Type</TabsTrigger>
          <TabsTrigger value="by-type">By Time Type</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hours Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Hours Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Billable Hours</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{timeAnalytics.billableHours.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">
                        {timeAnalytics.billablePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">Non-Billable Hours</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{timeAnalytics.nonBillableHours.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">
                        {(100 - timeAnalytics.billablePercentage).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Peak Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{timeAnalytics.peakHours.day}</p>
                    <p className="text-sm text-muted-foreground">Peak Day</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{timeAnalytics.peakHours.hour}:00</p>
                    <p className="text-sm text-muted-foreground">Peak Hour</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{timeAnalytics.peakHours.count}</p>
                    <p className="text-sm text-muted-foreground">Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Productivity Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Productivity trend chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hours by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Billable Hours</TableHead>
                    <TableHead className="text-right">Non-Billable Hours</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(timeAnalytics.hoursByUser).map(([userId, hours]) => {
                    const billableHours = hours * (timeAnalytics.billablePercentage / 100);
                    const nonBillableHours = hours - billableHours;
                    const utilization = (billableHours / hours) * 100;
                    
                    return (
                      <TableRow key={userId}>
                        <TableCell className="font-medium">User {userId}</TableCell>
                        <TableCell className="text-right">{hours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">{billableHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">{nonBillableHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">
                          <Badge className={getUtilizationColor(utilization)}>
                            {getUtilizationIcon(utilization)}
                            <span className="ml-1">{utilization.toFixed(1)}%</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUserDetails?.(userId)}
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hours by Contract Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Type</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(timeAnalytics.hoursByContractType)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, hours]) => {
                      const percentage = (hours / timeAnalytics.totalHours) * 100;
                      
                      return (
                        <TableRow key={type}>
                          <TableCell className="font-medium">
                            {getContractTypeName(type as ContractType)}
                          </TableCell>
                          <TableCell className="text-right">{hours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm">{percentage.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewContractDetails?.(type)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hours by Time Entry Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(timeAnalytics.hoursByType).map(([type, hours]) => {
                  const percentage = (hours / timeAnalytics.totalHours) * 100;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(type as TimeEntryType)}>
                            {getTimeEntryTypeName(type as TimeEntryType)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{hours.toFixed(1)}h</p>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            type === 'BILLABLE' ? 'bg-green-500' :
                            type === 'NON_BILLABLE' ? 'bg-red-500' :
                            type === 'ADMINISTRATIVE' ? 'bg-blue-500' :
                            type === 'TRAINING' ? 'bg-purple-500' : 'bg-orange-500'
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
