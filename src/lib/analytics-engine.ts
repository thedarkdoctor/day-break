import {
  TimeEntry,
  Client,
  Contract,
  ProfitabilityMetrics,
  TimeAnalytics,
  RiskAnalytics,
  DashboardMetrics,
  DashboardAlert,
  AnalyticsFilter,
  ChartData,
  KPI,
  TimePeriod,
  ContractType,
  RiskLevel,
  TimeEntryType
} from '@/types/analytics';

export class AnalyticsEngine {
  private timeEntries: Map<string, TimeEntry> = new Map();
  private clients: Map<string, Client> = new Map();
  private contracts: Map<string, Contract> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Calculate profitability metrics for a client
   */
  calculateClientProfitability(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): ProfitabilityMetrics {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const clientTimeEntries = this.getTimeEntriesForClient(clientId, startDate, endDate);
    const clientContracts = this.getContractsForClient(clientId);

    const totalRevenue = this.calculateTotalRevenue(clientTimeEntries);
    const totalCosts = this.calculateTotalCosts(clientTimeEntries, clientContracts);
    const grossProfit = totalRevenue - totalCosts;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const billableHours = clientTimeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    const nonBillableHours = clientTimeEntries
      .filter(entry => !entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    const totalHours = billableHours + nonBillableHours;
    const averageHourlyRate = billableHours > 0 ? totalRevenue / billableHours : 0;

    // Calculate utilization rate (billable hours / total available hours)
    const workingDays = this.calculateWorkingDays(startDate, endDate);
    const availableHours = workingDays * 8; // Assuming 8 hours per day
    const utilizationRate = availableHours > 0 ? (totalHours / availableHours) * 100 : 0;

    // Calculate realization rate (billable hours / total hours worked)
    const realizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    // Calculate collection rate (collected revenue / billed revenue)
    const collectionRate = this.calculateCollectionRate(clientTimeEntries);

    const contractsCount = clientContracts.length;
    const averageContractValue = contractsCount > 0 
      ? clientContracts.reduce((sum, contract) => sum + contract.value, 0) / contractsCount 
      : 0;

    const clientLifetimeValue = this.calculateClientLifetimeValue(clientId);
    const acquisitionCost = this.calculateAcquisitionCost(clientId);
    const retentionRate = this.calculateRetentionRate(clientId);
    const churnRate = 100 - retentionRate;

    return {
      clientId,
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalRevenue,
      totalCosts,
      grossProfit,
      grossProfitMargin,
      netProfit: grossProfit, // Simplified - would include overhead, taxes, etc.
      netProfitMargin: grossProfitMargin, // Simplified
      billableHours,
      nonBillableHours,
      averageHourlyRate,
      utilizationRate,
      realizationRate,
      collectionRate,
      contractsCount,
      averageContractValue,
      clientLifetimeValue,
      acquisitionCost,
      retentionRate,
      churnRate
    };
  }

  /**
   * Calculate time analytics for a period
   */
  calculateTimeAnalytics(
    startDate: Date,
    endDate: Date,
    filter?: AnalyticsFilter
  ): TimeAnalytics {
    const timeEntries = this.getTimeEntriesForPeriod(startDate, endDate, filter);
    
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);
    const nonBillableHours = totalHours - billableHours;
    const billablePercentage = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    // Hours by type
    const hoursByType = this.groupHoursByType(timeEntries);
    
    // Hours by contract type
    const hoursByContractType = this.groupHoursByContractType(timeEntries);
    
    // Hours by client
    const hoursByClient = this.groupHoursByClient(timeEntries);
    
    // Hours by user
    const hoursByUser = this.groupHoursByUser(timeEntries);

    const workingDays = this.calculateWorkingDays(startDate, endDate);
    const averageHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;

    const peakHours = this.calculatePeakHours(timeEntries);

    const productivityTrends = this.calculateProductivityTrends(timeEntries, startDate, endDate);

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalHours,
      billableHours,
      nonBillableHours,
      billablePercentage,
      hoursByType,
      hoursByContractType,
      hoursByClient,
      hoursByUser,
      averageHoursPerDay,
      peakHours,
      productivityTrends
    };
  }

  /**
   * Calculate risk analytics for a period
   */
  calculateRiskAnalytics(
    startDate: Date,
    endDate: Date,
    filter?: AnalyticsFilter
  ): RiskAnalytics {
    const contracts = this.getContractsForPeriod(startDate, endDate, filter);
    
    const totalContracts = contracts.length;
    const riskDistribution = this.calculateRiskDistribution(contracts);
    
    const riskTrends = this.calculateRiskTrends(contracts, startDate, endDate);
    
    const riskByContractType = this.calculateRiskByContractType(contracts);
    
    const riskByClient = this.calculateRiskByClient(contracts);
    
    const riskMitigation = this.calculateRiskMitigation(contracts);

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalContracts,
      riskDistribution,
      riskTrends,
      riskByContractType,
      riskByClient,
      riskMitigation
    };
  }

  /**
   * Generate comprehensive dashboard metrics
   */
  generateDashboardMetrics(
    startDate: Date,
    endDate: Date,
    filter?: AnalyticsFilter
  ): DashboardMetrics {
    const allClients = Array.from(this.clients.values());
    const allContracts = Array.from(this.contracts.values());
    const activeContracts = allContracts.filter(c => c.status === 'ACTIVE');
    
    const timeAnalytics = this.calculateTimeAnalytics(startDate, endDate, filter);
    const riskAnalytics = this.calculateRiskAnalytics(startDate, endDate, filter);
    
    // Calculate client profitabilities
    const clientIds = filter?.clients || allClients.map(c => c.id);
    const profitabilities = clientIds.map(clientId => 
      this.calculateClientProfitability(clientId, startDate, endDate)
    );

    const totalRevenue = profitabilities.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalCosts = profitabilities.reduce((sum, p) => sum + p.totalCosts, 0);
    const totalHours = timeAnalytics.totalHours;
    const averageUtilization = profitabilities.length > 0 
      ? profitabilities.reduce((sum, p) => sum + p.utilizationRate, 0) / profitabilities.length 
      : 0;

    const riskScore = this.calculateOverallRiskScore(riskAnalytics);

    const trends = this.calculateTrends(startDate, endDate, filter);
    const alerts = this.generateAlerts(profitabilities, timeAnalytics, riskAnalytics);

    return {
      overview: {
        totalClients: allClients.length,
        activeContracts: activeContracts.length,
        totalRevenue,
        totalHours,
        averageUtilization,
        riskScore
      },
      profitability: profitabilities,
      timeTracking: timeAnalytics,
      riskAnalysis: riskAnalytics,
      trends,
      alerts
    };
  }

  /**
   * Generate KPIs for dashboard
   */
  generateKPIs(
    startDate: Date,
    endDate: Date,
    filter?: AnalyticsFilter
  ): KPI[] {
    const metrics = this.generateDashboardMetrics(startDate, endDate, filter);
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    const previousMetrics = this.generateDashboardMetrics(previousPeriod.start, previousPeriod.end, filter);

    return [
      {
        id: 'total-revenue',
        name: 'Total Revenue',
        value: metrics.overview.totalRevenue,
        previousValue: previousMetrics.overview.totalRevenue,
        change: metrics.overview.totalRevenue - previousMetrics.overview.totalRevenue,
        changePercentage: this.calculatePercentageChange(
          previousMetrics.overview.totalRevenue,
          metrics.overview.totalRevenue
        ),
        trend: this.getTrend(previousMetrics.overview.totalRevenue, metrics.overview.totalRevenue),
        unit: 'USD',
        format: 'CURRENCY',
        category: 'REVENUE',
        description: 'Total revenue generated in the period'
      },
      {
        id: 'utilization-rate',
        name: 'Average Utilization',
        value: metrics.overview.averageUtilization,
        previousValue: previousMetrics.overview.averageUtilization,
        change: metrics.overview.averageUtilization - previousMetrics.overview.averageUtilization,
        changePercentage: this.calculatePercentageChange(
          previousMetrics.overview.averageUtilization,
          metrics.overview.averageUtilization
        ),
        trend: this.getTrend(previousMetrics.overview.averageUtilization, metrics.overview.averageUtilization),
        target: 80,
        unit: '%',
        format: 'PERCENTAGE',
        category: 'TIME',
        description: 'Average team utilization rate'
      },
      {
        id: 'risk-score',
        name: 'Risk Score',
        value: metrics.overview.riskScore,
        previousValue: previousMetrics.overview.riskScore,
        change: metrics.overview.riskScore - previousMetrics.overview.riskScore,
        changePercentage: this.calculatePercentageChange(
          previousMetrics.overview.riskScore,
          metrics.overview.riskScore
        ),
        trend: this.getTrend(previousMetrics.overview.riskScore, metrics.overview.riskScore),
        unit: 'points',
        format: 'NUMBER',
        category: 'RISK',
        description: 'Overall portfolio risk score (lower is better)'
      },
      {
        id: 'billable-hours',
        name: 'Billable Hours',
        value: metrics.timeTracking.billableHours,
        previousValue: previousMetrics.timeTracking.billableHours,
        change: metrics.timeTracking.billableHours - previousMetrics.timeTracking.billableHours,
        changePercentage: this.calculatePercentageChange(
          previousMetrics.timeTracking.billableHours,
          metrics.timeTracking.billableHours
        ),
        trend: this.getTrend(previousMetrics.timeTracking.billableHours, metrics.timeTracking.billableHours),
        unit: 'hours',
        format: 'HOURS',
        category: 'TIME',
        description: 'Total billable hours tracked'
      }
    ];
  }

  /**
   * Generate chart data for visualizations
   */
  generateChartData(
    type: 'PROFITABILITY' | 'TIME_TRACKING' | 'RISK_ANALYSIS' | 'REVENUE_TREND',
    startDate: Date,
    endDate: Date,
    filter?: AnalyticsFilter
  ): ChartData {
    switch (type) {
      case 'PROFITABILITY':
        return this.generateProfitabilityChartData(startDate, endDate, filter);
      case 'TIME_TRACKING':
        return this.generateTimeTrackingChartData(startDate, endDate, filter);
      case 'RISK_ANALYSIS':
        return this.generateRiskAnalysisChartData(startDate, endDate, filter);
      case 'REVENUE_TREND':
        return this.generateRevenueTrendChartData(startDate, endDate, filter);
      default:
        throw new Error('Invalid chart type');
    }
  }

  // Helper methods
  private calculateTotalRevenue(timeEntries: TimeEntry[]): number {
    return timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.hours * entry.rate), 0);
  }

  private calculateTotalCosts(timeEntries: TimeEntry[], contracts: Contract[]): number {
    // Simplified cost calculation - would include actual costs, overhead, etc.
    const laborCosts = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate * 0.3), 0);
    const contractCosts = contracts.reduce((sum, contract) => sum + contract.metadata.expenses, 0);
    return laborCosts + contractCosts;
  }

  private calculateCollectionRate(timeEntries: TimeEntry[]): number {
    // Simplified - would track actual collections vs. billings
    return 95; // Placeholder
  }

  private calculateClientLifetimeValue(clientId: string): number {
    const clientTimeEntries = Array.from(this.timeEntries.values())
      .filter(entry => entry.clientId === clientId);
    return this.calculateTotalRevenue(clientTimeEntries);
  }

  private calculateAcquisitionCost(clientId: string): number {
    // Simplified - would track actual acquisition costs
    return 5000; // Placeholder
  }

  private calculateRetentionRate(clientId: string): number {
    // Simplified - would track actual retention
    return 85; // Placeholder
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      if (current.getDay() !== 0 && current.getDay() !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  private groupHoursByType(timeEntries: TimeEntry[]): Record<TimeEntryType, number> {
    const grouped: Record<TimeEntryType, number> = {
      'BILLABLE': 0,
      'NON_BILLABLE': 0,
      'ADMINISTRATIVE': 0,
      'TRAINING': 0,
      'RESEARCH': 0
    };

    timeEntries.forEach(entry => {
      grouped[entry.type] = (grouped[entry.type] || 0) + entry.hours;
    });

    return grouped;
  }

  private groupHoursByContractType(timeEntries: TimeEntry[]): Record<ContractType, number> {
    const grouped: Record<ContractType, number> = {} as Record<ContractType, number>;

    timeEntries.forEach(entry => {
      grouped[entry.contractType] = (grouped[entry.contractType] || 0) + entry.hours;
    });

    return grouped;
  }

  private groupHoursByClient(timeEntries: TimeEntry[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    timeEntries.forEach(entry => {
      grouped[entry.clientId] = (grouped[entry.clientId] || 0) + entry.hours;
    });

    return grouped;
  }

  private groupHoursByUser(timeEntries: TimeEntry[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    timeEntries.forEach(entry => {
      grouped[entry.userId] = (grouped[entry.userId] || 0) + entry.hours;
    });

    return grouped;
  }

  private calculatePeakHours(timeEntries: TimeEntry[]): { day: string; hour: number; count: number } {
    // Simplified - would analyze actual time patterns
    return {
      day: 'Tuesday',
      hour: 10,
      count: 15
    };
  }

  private calculateProductivityTrends(
    timeEntries: TimeEntry[],
    startDate: Date,
    endDate: Date
  ): { date: string; billableHours: number; nonBillableHours: number; efficiency: number }[] {
    // Simplified - would calculate daily trends
    const trends = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayEntries = timeEntries.filter(entry => 
        entry.date.toDateString() === current.toDateString()
      );
      
      const billableHours = dayEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + entry.hours, 0);
      
      const nonBillableHours = dayEntries
        .filter(entry => !entry.billable)
        .reduce((sum, entry) => sum + entry.hours, 0);
      
      const totalHours = billableHours + nonBillableHours;
      const efficiency = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
      
      trends.push({
        date: current.toISOString().split('T')[0],
        billableHours,
        nonBillableHours,
        efficiency
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return trends;
  }

  private calculateRiskDistribution(contracts: Contract[]): Record<RiskLevel, number> {
    const distribution: Record<RiskLevel, number> = {
      'LOW': 0,
      'MEDIUM': 0,
      'HIGH': 0,
      'CRITICAL': 0
    };

    contracts.forEach(contract => {
      distribution[contract.riskLevel]++;
    });

    return distribution;
  }

  private calculateRiskTrends(
    contracts: Contract[],
    startDate: Date,
    endDate: Date
  ): { date: string; low: number; medium: number; high: number; critical: number }[] {
    // Simplified - would calculate actual trends
    return [];
  }

  private calculateRiskByContractType(contracts: Contract[]): Record<ContractType, any> {
    const grouped: Record<ContractType, any> = {} as Record<ContractType, any>;

    contracts.forEach(contract => {
      if (!grouped[contract.type]) {
        grouped[contract.type] = {
          total: 0,
          riskDistribution: { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0 },
          averageRiskScore: 0
        };
      }
      
      grouped[contract.type].total++;
      grouped[contract.type].riskDistribution[contract.riskLevel]++;
    });

    // Calculate average risk scores
    Object.keys(grouped).forEach(type => {
      const contractsOfType = contracts.filter(c => c.type === type as ContractType);
      const riskScores = contractsOfType.map(c => this.getRiskScore(c.riskLevel));
      grouped[type as ContractType].averageRiskScore = 
        riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    });

    return grouped;
  }

  private calculateRiskByClient(contracts: Contract[]): Record<string, any> {
    const grouped: Record<string, any> = {};

    contracts.forEach(contract => {
      if (!grouped[contract.clientId]) {
        grouped[contract.clientId] = {
          totalContracts: 0,
          riskDistribution: { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0 },
          averageRiskScore: 0,
          riskTrend: 'STABLE'
        };
      }
      
      grouped[contract.clientId].totalContracts++;
      grouped[contract.clientId].riskDistribution[contract.riskLevel]++;
    });

    // Calculate average risk scores and trends
    Object.keys(grouped).forEach(clientId => {
      const clientContracts = contracts.filter(c => c.clientId === clientId);
      const riskScores = clientContracts.map(c => this.getRiskScore(c.riskLevel));
      grouped[clientId].averageRiskScore = 
        riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    });

    return grouped;
  }

  private calculateRiskMitigation(contracts: Contract[]): any {
    // Simplified - would analyze actual mitigation measures
    return {
      contractsWithMitigation: Math.floor(contracts.length * 0.3),
      mitigationEffectiveness: 75,
      commonRiskFactors: ['Data Protection', 'Liability', 'Termination'],
      recommendedActions: ['Review data handling procedures', 'Update liability clauses']
    };
  }

  private calculateOverallRiskScore(riskAnalytics: RiskAnalytics): number {
    const weights = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const total = Object.values(riskAnalytics.riskDistribution).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return 0;
    
    const weightedSum = Object.entries(riskAnalytics.riskDistribution)
      .reduce((sum, [level, count]) => sum + (weights[level as RiskLevel] * count), 0);
    
    return (weightedSum / total) * 25; // Scale to 0-100
  }

  private calculateTrends(startDate: Date, endDate: Date, filter?: AnalyticsFilter): any {
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    const currentMetrics = this.generateDashboardMetrics(startDate, endDate, filter);
    const previousMetrics = this.generateDashboardMetrics(previousPeriod.start, previousPeriod.end, filter);

    return {
      revenueGrowth: this.calculatePercentageChange(
        previousMetrics.overview.totalRevenue,
        currentMetrics.overview.totalRevenue
      ),
      clientGrowth: this.calculatePercentageChange(
        previousMetrics.overview.totalClients,
        currentMetrics.overview.totalClients
      ),
      contractGrowth: this.calculatePercentageChange(
        previousMetrics.overview.activeContracts,
        currentMetrics.overview.activeContracts
      ),
      riskImprovement: this.calculatePercentageChange(
        currentMetrics.overview.riskScore,
        previousMetrics.overview.riskScore
      )
    };
  }

  private generateAlerts(profitabilities: ProfitabilityMetrics[], timeAnalytics: TimeAnalytics, riskAnalytics: RiskAnalytics): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    // Low profitability alert
    const lowProfitClients = profitabilities.filter(p => p.grossProfitMargin < 10);
    if (lowProfitClients.length > 0) {
      alerts.push({
        id: 'low-profitability',
        type: 'WARNING',
        title: 'Low Profitability Detected',
        message: `${lowProfitClients.length} clients have profitability below 10%`,
        priority: 'HIGH',
        category: 'PROFITABILITY',
        actionable: true,
        actionText: 'Review Client Pricing',
        acknowledged: false,
        createdAt: new Date()
      });
    }

    // High risk alert
    if (riskAnalytics.riskDistribution.CRITICAL > 0) {
      alerts.push({
        id: 'critical-risk',
        type: 'ERROR',
        title: 'Critical Risk Contracts',
        message: `${riskAnalytics.riskDistribution.CRITICAL} contracts have critical risk levels`,
        priority: 'CRITICAL',
        category: 'RISK',
        actionable: true,
        actionText: 'Review Risk Mitigation',
        acknowledged: false,
        createdAt: new Date()
      });
    }

    // Low utilization alert
    if (timeAnalytics.billablePercentage < 70) {
      alerts.push({
        id: 'low-utilization',
        type: 'WARNING',
        title: 'Low Billable Hours',
        message: `Only ${timeAnalytics.billablePercentage.toFixed(1)}% of hours are billable`,
        priority: 'MEDIUM',
        category: 'TIME_TRACKING',
        actionable: true,
        actionText: 'Review Time Tracking',
        acknowledged: false,
        createdAt: new Date()
      });
    }

    return alerts;
  }

  private getRiskScore(riskLevel: RiskLevel): number {
    const scores = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return scores[riskLevel];
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private getTrend(oldValue: number, newValue: number): 'UP' | 'DOWN' | 'STABLE' {
    const change = newValue - oldValue;
    if (Math.abs(change) < 0.01) return 'STABLE';
    return change > 0 ? 'UP' : 'DOWN';
  }

  private getPreviousPeriod(startDate: Date, endDate: Date): { start: Date; end: Date } {
    const duration = endDate.getTime() - startDate.getTime();
    return {
      start: new Date(startDate.getTime() - duration),
      end: new Date(startDate.getTime() - 1)
    };
  }

  private getTimeEntriesForClient(clientId: string, startDate: Date, endDate: Date): TimeEntry[] {
    return Array.from(this.timeEntries.values())
      .filter(entry => 
        entry.clientId === clientId &&
        entry.date >= startDate &&
        entry.date <= endDate
      );
  }

  private getContractsForClient(clientId: string): Contract[] {
    return Array.from(this.contracts.values())
      .filter(contract => contract.clientId === clientId);
  }

  private getTimeEntriesForPeriod(startDate: Date, endDate: Date, filter?: AnalyticsFilter): TimeEntry[] {
    let entries = Array.from(this.timeEntries.values())
      .filter(entry => entry.date >= startDate && entry.date <= endDate);

    if (filter) {
      if (filter.clients) {
        entries = entries.filter(entry => filter.clients!.includes(entry.clientId));
      }
      if (filter.contracts) {
        entries = entries.filter(entry => filter.contracts!.includes(entry.contractId));
      }
      if (filter.users) {
        entries = entries.filter(entry => filter.users!.includes(entry.userId));
      }
      if (filter.contractTypes) {
        entries = entries.filter(entry => filter.contractTypes!.includes(entry.contractType));
      }
      if (filter.timeEntryTypes) {
        entries = entries.filter(entry => filter.timeEntryTypes!.includes(entry.type));
      }
    }

    return entries;
  }

  private getContractsForPeriod(startDate: Date, endDate: Date, filter?: AnalyticsFilter): Contract[] {
    let contracts = Array.from(this.contracts.values())
      .filter(contract => 
        contract.startDate >= startDate && 
        (contract.endDate === undefined || contract.endDate <= endDate)
      );

    if (filter) {
      if (filter.clients) {
        contracts = contracts.filter(contract => filter.clients!.includes(contract.clientId));
      }
      if (filter.contracts) {
        contracts = contracts.filter(contract => filter.contracts!.includes(contract.id));
      }
      if (filter.contractTypes) {
        contracts = contracts.filter(contract => filter.contractTypes!.includes(contract.type));
      }
      if (filter.riskLevels) {
        contracts = contracts.filter(contract => filter.riskLevels!.includes(contract.riskLevel));
      }
    }

    return contracts;
  }

  private generateProfitabilityChartData(startDate: Date, endDate: Date, filter?: AnalyticsFilter): ChartData {
    const clients = filter?.clients || Array.from(this.clients.keys());
    const profitabilities = clients.map(clientId => 
      this.calculateClientProfitability(clientId, startDate, endDate)
    );

    return {
      labels: profitabilities.map(p => this.clients.get(p.clientId)?.name || 'Unknown'),
      datasets: [{
        label: 'Gross Profit Margin (%)',
        data: profitabilities.map(p => p.grossProfitMargin),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }]
    };
  }

  private generateTimeTrackingChartData(startDate: Date, endDate: Date, filter?: AnalyticsFilter): ChartData {
    const timeAnalytics = this.calculateTimeAnalytics(startDate, endDate, filter);
    
    return {
      labels: Object.keys(timeAnalytics.hoursByType),
      datasets: [{
        label: 'Hours',
        data: Object.values(timeAnalytics.hoursByType),
        backgroundColor: [
          'rgba(34, 197, 94, 0.2)',
          'rgba(239, 68, 68, 0.2)',
          'rgba(59, 130, 246, 0.2)',
          'rgba(168, 85, 247, 0.2)',
          'rgba(245, 158, 11, 0.2)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 1
      }]
    };
  }

  private generateRiskAnalysisChartData(startDate: Date, endDate: Date, filter?: AnalyticsFilter): ChartData {
    const riskAnalytics = this.calculateRiskAnalytics(startDate, endDate, filter);
    
    return {
      labels: Object.keys(riskAnalytics.riskDistribution),
      datasets: [{
        label: 'Number of Contracts',
        data: Object.values(riskAnalytics.riskDistribution),
        backgroundColor: [
          'rgba(34, 197, 94, 0.2)',
          'rgba(245, 158, 11, 0.2)',
          'rgba(239, 68, 68, 0.2)',
          'rgba(127, 29, 29, 0.2)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(127, 29, 29, 1)'
        ],
        borderWidth: 1
      }]
    };
  }

  private generateRevenueTrendChartData(startDate: Date, endDate: Date, filter?: AnalyticsFilter): ChartData {
    // Simplified - would calculate actual daily/weekly revenue trends
    const labels = [];
    const data = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      labels.push(current.toISOString().split('T')[0]);
      data.push(Math.random() * 10000 + 5000); // Placeholder data
      current.setDate(current.getDate() + 1);
    }
    
    return {
      labels,
      datasets: [{
        label: 'Daily Revenue',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        fill: true
      }]
    };
  }

  private initializeSampleData(): void {
    // Initialize sample clients
    const clients: Client[] = [
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

    clients.forEach(client => this.clients.set(client.id, client));

    // Initialize sample contracts
    const contracts: Contract[] = [
      {
        id: 'contract-1',
        clientId: 'client-1',
        name: 'Data Processing Agreement',
        type: 'DATA_PROTECTION',
        status: 'ACTIVE',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2024-01-15'),
        value: 50000,
        currency: 'USD',
        riskLevel: 'MEDIUM',
        complexity: 'MODERATE',
        practiceArea: 'Privacy Law',
        responsibleAttorney: 'Alice Brown',
        teamMembers: ['Alice Brown', 'Bob Wilson'],
        tags: ['GDPR', 'data protection'],
        metadata: {
          estimatedHours: 100,
          actualHours: 85,
          hourlyRate: 400,
          expenses: 2000
        },
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'contract-2',
        clientId: 'client-2',
        name: 'Merger Agreement',
        type: 'MERGERS_ACQUISITIONS',
        status: 'ACTIVE',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-12-31'),
        value: 200000,
        currency: 'USD',
        riskLevel: 'HIGH',
        complexity: 'HIGHLY_COMPLEX',
        practiceArea: 'Corporate Law',
        responsibleAttorney: 'Charlie Davis',
        teamMembers: ['Charlie Davis', 'Diana Lee'],
        tags: ['merger', 'acquisition', 'corporate'],
        metadata: {
          estimatedHours: 500,
          actualHours: 320,
          hourlyRate: 500,
          expenses: 15000
        },
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date()
      }
    ];

    contracts.forEach(contract => this.contracts.set(contract.id, contract));

    // Initialize sample time entries
    const timeEntries: TimeEntry[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Add some sample time entries
      timeEntries.push({
        id: `time-${i}-1`,
        clientId: 'client-1',
        contractId: 'contract-1',
        userId: 'user-1',
        description: 'Contract review and analysis',
        hours: Math.random() * 4 + 2,
        rate: 400,
        type: 'BILLABLE',
        contractType: 'DATA_PROTECTION',
        date,
        billable: true,
        approved: true,
        tags: ['review', 'analysis'],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (i % 3 === 0) {
        timeEntries.push({
          id: `time-${i}-2`,
          clientId: 'client-2',
          contractId: 'contract-2',
          userId: 'user-2',
          description: 'Due diligence research',
          hours: Math.random() * 6 + 3,
          rate: 500,
          type: 'BILLABLE',
          contractType: 'MERGERS_ACQUISITIONS',
          date,
          billable: true,
          approved: true,
          tags: ['due diligence', 'research'],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    timeEntries.forEach(entry => this.timeEntries.set(entry.id, entry));
  }
}
