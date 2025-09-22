export type ComplianceFramework = 
  | 'GDPR' 
  | 'HIPAA' 
  | 'SOX' 
  | 'CCPA' 
  | 'PIPEDA' 
  | 'LGPD' 
  | 'ISO27001' 
  | 'SOC2' 
  | 'PCI-DSS' 
  | 'CUSTOM';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ClauseCategory = 
  | 'DATA_PROTECTION'
  | 'FINANCIAL_REPORTING'
  | 'HEALTHCARE_PRIVACY'
  | 'CONSUMER_RIGHTS'
  | 'SECURITY_REQUIREMENTS'
  | 'AUDIT_COMPLIANCE'
  | 'TERMINATION_RIGHTS'
  | 'LIABILITY_LIMITATION'
  | 'INTELLECTUAL_PROPERTY'
  | 'CONFIDENTIALITY'
  | 'DATA_RETENTION'
  | 'CROSS_BORDER_TRANSFER'
  | 'CONSENT_MANAGEMENT'
  | 'BREACH_NOTIFICATION'
  | 'THIRD_PARTY_SHARING';

export interface ComplianceRule {
  id: string;
  framework: ComplianceFramework;
  category: ClauseCategory;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  keywords: string[];
  patterns: RegExp[];
  weight: number; // 0-1, how much this rule contributes to overall risk
  jurisdiction?: string;
  clientId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  rule: ComplianceRule;
  clauseId: string;
  severity: RiskLevel;
  description: string;
  explanation: string;
  suggestedAction: string;
  detectedAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ComplianceScore {
  framework: ComplianceFramework;
  overallScore: number; // 0-100
  riskLevel: RiskLevel;
  violations: ComplianceViolation[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface ContractComplianceAnalysis {
  contractId: string;
  documentName: string;
  frameworks: ComplianceScore[];
  overallRiskLevel: RiskLevel;
  overallComplianceScore: number;
  criticalIssues: ComplianceViolation[];
  mediumIssues: ComplianceViolation[];
  lowIssues: ComplianceViolation[];
  autoTags: string[];
  jurisdiction: string;
  clientId?: string;
  analyzedAt: Date;
}

export interface ComplianceConfiguration {
  id: string;
  clientId?: string;
  jurisdiction: string;
  frameworks: ComplianceFramework[];
  customRules: ComplianceRule[];
  riskThresholds: {
    [key in RiskLevel]: number;
  };
  autoTaggingEnabled: boolean;
  notificationSettings: {
    email: boolean;
    slack: boolean;
    webhook?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
