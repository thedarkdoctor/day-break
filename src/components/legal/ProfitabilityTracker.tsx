import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  ProfitabilityMetrics, 
  Client, 
  Contract, 
  TimeEntry,
  AnalyticsFilter 
} from '@/types/analytics';
import { AnalyticsEngine } from '@/lib/analytics-engine';

interface ProfitabilityTrackerProps {
  onViewClientDetails?: (clientId: string) => void;
  onExportReport?: () => void;
}

export function ProfitabilityTracker({ onViewClientDetails, onExportReport }: ProfitabilityTrackerProps) {
  const [engine] = useState(() => new AnalyticsEngine());
  const [clients, setClients] = useState<Client[]>([]);
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityMetrics[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });
  const [sortBy, setSortBy] = useState<'revenue' | 'margin' | 'hours' | 'rate'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    loadProfitabilityData();
  }, [selectedClient, dateRange]);

  const loadClients = async () => {
    // In a real app, this would fetch from an API
    const sampleClients: Client[] = [
      {
        id: 'client-1',
        name: 'Acme Corporation',
        industry: 'Technology',
        size: 'LARGE',
        status: 'ACTIVE',
        acquisitionDate: new Date('2023-01-15'),
        lastActivity: new Date(),
        primaryContact: 'John Smith',
        billingAddress: '123 Tech Street, San Francisco, CA',
        timezone: 'PST',
        customFields: {},
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'client-2',
        name: 'Global Manufacturing Inc',
        industry: 'Manufacturing',
        size: 'ENTERPRISE',
        status: 'ACTIVE',
        acquisitionDate: new Date('2022-06-01'),
        lastActivity: new Date(),
        primaryContact: 'Sarah Johnson',
        billingAddress: '456 Industrial Ave, Detroit, MI',
        timezone: 'EST',
        customFields: {},
        createdAt: new Date('2022-06-01'),
        updatedAt: new Date()
      }
    ];
    setClients(sampleClients);
  };

  const loadProfitabilityData = async () => {
    setIsLoading(true);
    try {
      const clientIds = selectedClient === 'all' 
        ? clients.map(c => c.id)
        : [selectedClient];
      
      const data = clientIds.map(clientId => 
        engine.calculateClientProfitability(clientId, dateRange.start, dateRange.end)
      );
      
      // Sort the data
      const sortedData = data.sort((a, b) => {
        let aValue: number, bValue: number;
        
        switch (sortBy) {
          case 'revenue':
            aValue = a.totalRevenue;
            bValue = b.totalRevenue;
            break;
          case 'margin':
            aValue = a.grossProfitMargin;
            bValue = b.grossProfitMargin;
            break;
          case 'hours':
            aValue = a.billableHours;
            bValue = b.billableHours;
            break;
          case 'rate':
            aValue = a.averageHourlyRate;
            bValue = b.averageHourlyRate;
            break;
          default:
            aValue = a.totalRevenue;
            bValue = b.totalRevenue;
        }
        
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
      
      setProfitabilityData(sortedData);
    } catch (error) {
      console.error('Error loading profitability data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600 bg-green-50';
    if (margin >= 20) return 'text-yellow-600 bg-yellow-50';
    if (margin >= 10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getMarginIcon = (margin: number) => {
    if (margin >= 20) return <TrendingUp className="h-4 w-4" />;
    if (margin >= 10) return <Target className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const calculateTotalMetrics = () => {
    return profitabilityData.reduce((totals, client) => ({
      totalRevenue: totals.totalRevenue + client.totalRevenue,
      totalCosts: totals.totalCosts + client.totalCosts,
      grossProfit: totals.grossProfit + client.grossProfit,
      billableHours: totals.billableHours + client.billableHours,
      nonBillableHours: totals.nonBillableHours + client.nonBillableHours,
      contractsCount: totals.contractsCount + client.contractsCount
    }), {
      totalRevenue: 0,
      totalCosts: 0,
      grossProfit: 0,
      billableHours: 0,
      nonBillableHours: 0,
      contractsCount: 0
    });
  };

  const totals = calculateTotalMetrics();
  const overallMargin = totals.totalRevenue > 0 ? (totals.grossProfit / totals.totalRevenue) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading profitability data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Profitability Tracker</h1>
          <p className="text-muted-foreground">
            Monitor client profitability, billable hours, and revenue trends
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-filter">Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  start: new Date(e.target.value)
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  end: new Date(e.target.value)
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Total Revenue</SelectItem>
                  <SelectItem value="margin">Profit Margin</SelectItem>
                  <SelectItem value="hours">Billable Hours</SelectItem>
                  <SelectItem value="rate">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totals.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                <p className="text-2xl font-bold">${totals.grossProfit.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Margin</p>
                <p className={`text-2xl font-bold ${getMarginColor(overallMargin).split(' ')[0]}`}>
                  {overallMargin.toFixed(1)}%
                </p>
              </div>
              {getMarginIcon(overallMargin)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billable Hours</p>
                <p className="text-2xl font-bold">{totals.billableHours.toFixed(0)}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Client Profitability Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Costs</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Billable Hours</TableHead>
                <TableHead className="text-right">Avg Rate</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitabilityData.map((client) => (
                <TableRow key={client.clientId}>
                  <TableCell className="font-medium">
                    {getClientName(client.clientId)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${client.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${client.totalCosts.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${client.grossProfit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={getMarginColor(client.grossProfitMargin)}>
                      {getMarginIcon(client.grossProfitMargin)}
                      <span className="ml-1">{client.grossProfitMargin.toFixed(1)}%</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {client.billableHours.toFixed(1)}h
                  </TableCell>
                  <TableCell className="text-right">
                    ${client.averageHourlyRate.toFixed(0)}/h
                  </TableCell>
                  <TableCell className="text-right">
                    {client.utilizationRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewClientDetails?.(client.clientId)}
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

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profitabilityData.map((client) => {
                const percentage = totals.totalRevenue > 0 
                  ? (client.totalRevenue / totals.totalRevenue) * 100 
                  : 0;
                return (
                  <div key={client.clientId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {getClientName(client.clientId)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profitabilityData
                .filter(client => client.grossProfitMargin < 15)
                .map((client) => (
                  <div key={client.clientId} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Low Profitability Alert
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      {getClientName(client.clientId)} has a {client.grossProfitMargin.toFixed(1)}% margin
                    </p>
                  </div>
                ))}
              
              {profitabilityData
                .filter(client => client.grossProfitMargin >= 25)
                .map((client) => (
                  <div key={client.clientId} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        High Performance
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      {getClientName(client.clientId)} has a {client.grossProfitMargin.toFixed(1)}% margin
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
