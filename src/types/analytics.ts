export type TimeEntryType = 'BILLABLE' | 'NON_BILLABLE' | 'ADMINISTRATIVE' | 'TRAINING' | 'RESEARCH';

export type ContractType = 
  | 'MERGERS_ACQUISITIONS'
  | 'CORPORATE_GOVERNANCE'
  | 'COMMERCIAL_AGREEMENTS'
  | 'INTELLECTUAL_PROPERTY'
  | 'EMPLOYMENT_LABOR'
  | 'REAL_ESTATE'
  | 'LITIGATION'
  | 'REGULATORY_COMPLIANCE'
  | 'DATA_PROTECTION'
  | 'FINANCE_SECURITIES'
  | 'CUSTOM';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TimePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface TimeEntry {
  id: string;
  clientId: string;
  contractId: string;
  userId: string;
  description: string;
  hours: number;
  rate: number;
  type: TimeEntryType;
  contractType: ContractType;
  date: Date;
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'FORMER';
  acquisitionDate: Date;
  lastActivity: Date;
  primaryContact: string;
  billingAddress: string;
  timezone: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  clientId: string;
  name: string;
  type: ContractType;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED';
  startDate: Date;
  endDate?: Date;
  value: number;
  currency: string;
  riskLevel: RiskLevel;
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'HIGHLY_COMPLEX';
  practiceArea: string;
  responsibleAttorney: string;
  teamMembers: string[];
  tags: string[];
  metadata: {
    estimatedHours: number;
    actualHours: number;
    hourlyRate: number;
    fixedFee?: number;
    contingencyFee?: number;
    expenses: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfitabilityMetrics {
  clientId: string;
  period: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  billableHours: number;
  nonBillableHours: number;
  averageHourlyRate: number;
  utilizationRate: number;
  realizationRate: number;
  collectionRate: number;
  contractsCount: number;
  averageContractValue: number;
  clientLifetimeValue: number;
  acquisitionCost: number;
  retentionRate: number;
  churnRate: number;
}

export interface TimeAnalytics {
  period: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billablePercentage: number;
  hoursByType: Record<TimeEntryType, number>;
  hoursByContractType: Record<ContractType, number>;
  hoursByClient: Record<string, number>;
  hoursByUser: Record<string, number>;
  averageHoursPerDay: number;
  peakHours: {
    day: string;
    hour: number;
    count: number;
  };
  productivityTrends: {
    date: string;
    billableHours: number;
    nonBillableHours: number;
    efficiency: number;
  }[];
}

export interface RiskAnalytics {
  period: string;
  totalContracts: number;
  riskDistribution: Record<RiskLevel, number>;
  riskTrends: {
    date: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }[];
  riskByContractType: Record<ContractType, {
    total: number;
    riskDistribution: Record<RiskLevel, number>;
    averageRiskScore: number;
  }>;
  riskByClient: Record<string, {
    totalContracts: number;
    riskDistribution: Record<RiskLevel, number>;
    averageRiskScore: number;
    riskTrend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  }>;
  riskMitigation: {
    contractsWithMitigation: number;
    mitigationEffectiveness: number;
    commonRiskFactors: string[];
    recommendedActions: string[];
  };
}

export interface DashboardMetrics {
  overview: {
    totalClients: number;
    activeContracts: number;
    totalRevenue: number;
    totalHours: number;
    averageUtilization: number;
    riskScore: number;
  };
  profitability: ProfitabilityMetrics[];
  timeTracking: TimeAnalytics;
  riskAnalysis: RiskAnalytics;
  trends: {
    revenueGrowth: number;
    clientGrowth: number;
    contractGrowth: number;
    riskImprovement: number;
  };
  alerts: DashboardAlert[];
}

export interface DashboardAlert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'PROFITABILITY' | 'TIME_TRACKING' | 'RISK' | 'COMPLIANCE' | 'PERFORMANCE';
  clientId?: string;
  contractId?: string;
  userId?: string;
  actionable: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: Date;
  expiresAt?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  clients?: string[];
  contracts?: string[];
  users?: string[];
  contractTypes?: ContractType[];
  timeEntryTypes?: TimeEntryType[];
  riskLevels?: RiskLevel[];
  practiceAreas?: string[];
  tags?: string[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  target?: number;
  unit: string;
  format: 'CURRENCY' | 'PERCENTAGE' | 'NUMBER' | 'HOURS';
  category: 'REVENUE' | 'PROFITABILITY' | 'TIME' | 'RISK' | 'CLIENTS';
  description: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'PROFITABILITY' | 'TIME_TRACKING' | 'RISK_ANALYSIS' | 'CLIENT_ANALYSIS' | 'CUSTOM';
  description: string;
  filters: AnalyticsFilter;
  schedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  recipients: string[];
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  lastGenerated?: Date;
  nextGeneration?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface Benchmark {
  id: string;
  name: string;
  category: 'INDUSTRY' | 'FIRM' | 'CLIENT' | 'CONTRACT_TYPE';
  metric: string;
  value: number;
  percentile: number;
  source: string;
  period: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  category: 'REVENUE' | 'PROFITABILITY' | 'UTILIZATION' | 'CLIENT_ACQUISITION' | 'RISK_REDUCTION';
  target: number;
  current: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_TRACK' | 'AT_RISK' | 'COMPLETED' | 'FAILED';
  owner: string;
  stakeholders: string[];
  milestones: {
    name: string;
    target: number;
    current: number;
    dueDate: Date;
    completed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
