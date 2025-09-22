import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Shield, 
  Users, 
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ProfitabilityTracker } from './ProfitabilityTracker';
import { TimeTrackingAnalytics } from './TimeTrackingAnalytics';
import { RiskAnalytics } from './RiskAnalytics';

export function AnalyticsDemo() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const handleViewDetails = (type: string, id: string) => {
    console.log(`View details for ${type}: ${id}`);
  };

  const handleExportReport = (type: string) => {
    console.log(`Export ${type} report`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics & Dashboards</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for client profitability, time tracking, and risk management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Client Profitability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Revenue and cost tracking per client
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Gross and net profit margin analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Client lifetime value calculations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Utilization and realization rates
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Billable vs non-billable hours analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Hours by contract type and user
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Productivity trends and patterns
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Peak activity identification
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Risk level tracking over time
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Risk distribution by contract type
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Client risk profile analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Mitigation effectiveness tracking
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sample KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$2,450,000</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold">78.5%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+3.2%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-green-600">24.3</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">-8.1%</span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">47</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+5</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview Dashboard</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AnalyticsDashboard 
            onViewDetails={handleViewDetails}
            onExportReport={handleExportReport}
          />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <ProfitabilityTracker 
            onViewClientDetails={(clientId) => handleViewDetails('client', clientId)}
            onExportReport={() => handleExportReport('profitability')}
          />
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-4">
          <TimeTrackingAnalytics 
            onViewUserDetails={(userId) => handleViewDetails('user', userId)}
            onViewContractDetails={(contractId) => handleViewDetails('contract', contractId)}
            onExportReport={() => handleExportReport('time-tracking')}
          />
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <RiskAnalytics 
            onViewContractDetails={(contractId) => handleViewDetails('contract', contractId)}
            onViewClientDetails={(clientId) => handleViewDetails('client', clientId)}
            onExportReport={() => handleExportReport('risk-analysis')}
          />
        </TabsContent>
      </Tabs>

      {/* Sample Charts Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend (Sample)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Revenue trend chart would be displayed here</p>
                <p className="text-sm">Showing monthly revenue growth over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Client Distribution (Sample)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Client distribution chart would be displayed here</p>
                <p className="text-sm">Showing revenue distribution by client</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">High Performance</span>
              </div>
              <p className="text-xs text-green-700">
                Client A shows 35% profit margin with excellent utilization rates
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Attention Needed</span>
              </div>
              <p className="text-xs text-yellow-700">
                Client B has declining profitability - review pricing strategy
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Opportunity</span>
              </div>
              <p className="text-xs text-blue-700">
                M&A practice shows 40% higher margins - consider expansion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
