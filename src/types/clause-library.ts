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
  | 'THIRD_PARTY_SHARING'
  | 'PAYMENT_TERMS'
  | 'SERVICE_LEVEL_AGREEMENTS'
  | 'FORCE_MAJEURE'
  | 'GOVERNING_LAW'
  | 'DISPUTE_RESOLUTION'
  | 'INDEMNIFICATION'
  | 'WARRANTIES'
  | 'REPRESENTATIONS'
  | 'COVENANTS'
  | 'CONDITIONS_PRECEDENT'
  | 'REMEDIES'
  | 'LIMITATION_OF_LIABILITY'
  | 'TERMINATION'
  | 'SURVIVAL'
  | 'ASSIGNMENT'
  | 'AMENDMENT'
  | 'SEVERABILITY'
  | 'ENTIRE_AGREEMENT'
  | 'NOTICES'
  | 'COUNTERPARTS'
  | 'CUSTOM';

export type ClauseStatus = 'DRAFT' | 'APPROVED' | 'DEPRECATED' | 'ARCHIVED';

export type SuggestionType = 'IMPROVEMENT' | 'COMPLIANCE' | 'RISK_REDUCTION' | 'CLARITY' | 'LEGAL_STRENGTH';

export interface ClauseTemplate {
  id: string;
  title: string;
  description: string;
  category: ClauseCategory;
  content: string;
  alternativeVersions: ClauseVersion[];
  tags: string[];
  status: ClauseStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceFrameworks: string[];
  jurisdiction: string;
  language: string;
  author: string;
  lastModified: Date;
  createdAt: Date;
  usageCount: number;
  isPublic: boolean;
  firmId?: string;
  clientId?: string;
  metadata: {
    wordCount: number;
    complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
    legalPrecedent?: string;
    courtCases?: string[];
    regulatoryReferences?: string[];
  };
}

export interface ClauseVersion {
  id: string;
  version: string;
  content: string;
  changes: string;
  author: string;
  createdAt: Date;
  isActive: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ClauseSuggestion {
  id: string;
  originalClause: string;
  suggestedClause: string;
  suggestionType: SuggestionType;
  title: string;
  description: string;
  reasoning: string;
  benefits: string[];
  risks: string[];
  complianceImprovements: string[];
  confidence: number; // 0-1
  source: 'AI_ANALYSIS' | 'LEGAL_PRECEDENT' | 'BEST_PRACTICE' | 'USER_SUGGESTION';
  suggestedBy: string;
  createdAt: Date;
  isAccepted: boolean;
  acceptedAt?: Date;
  acceptedBy?: string;
  rejectionReason?: string;
  relatedClauseId?: string;
  relatedTemplateId?: string;
}

export interface ClauseLibrary {
  id: string;
  name: string;
  description: string;
  firmId: string;
  isPublic: boolean;
  categories: ClauseCategory[];
  clauses: ClauseTemplate[];
  totalClauses: number;
  lastUpdated: Date;
  createdAt: Date;
  settings: {
    allowPublicSharing: boolean;
    requireApproval: boolean;
    autoTagging: boolean;
    versionControl: boolean;
  };
}

export interface ClauseSearchFilters {
  categories?: ClauseCategory[];
  status?: ClauseStatus[];
  riskLevel?: string[];
  complianceFrameworks?: string[];
  jurisdiction?: string;
  language?: string;
  author?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  isPublic?: boolean;
  firmId?: string;
}

export interface ClauseComparison {
  id: string;
  originalClause: string;
  suggestedClause: string;
  differences: ClauseDifference[];
  overallScore: number;
  improvements: string[];
  concerns: string[];
  recommendation: 'ACCEPT' | 'REJECT' | 'MODIFY';
  createdAt: Date;
}

export interface ClauseDifference {
  type: 'ADDITION' | 'DELETION' | 'MODIFICATION' | 'REORDERING';
  originalText: string;
  modifiedText: string;
  position: {
    start: number;
    end: number;
  };
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
}

export interface ClauseUsage {
  id: string;
  clauseId: string;
  contractId: string;
  contractName: string;
  usedAt: Date;
  usedBy: string;
  context: string;
  modifications?: string;
  isActive: boolean;
}

export interface ClauseAnalytics {
  clauseId: string;
  totalUsage: number;
  uniqueContracts: number;
  averageRating: number;
  lastUsed: Date;
  mostCommonModifications: string[];
  usageByCategory: Record<ClauseCategory, number>;
  usageByFirm: Record<string, number>;
  performanceMetrics: {
    acceptanceRate: number;
    modificationRate: number;
    disputeRate: number;
  };
}

export interface SmartSuggestionRequest {
  originalClause: string;
  context: string;
  category: ClauseCategory;
  complianceFrameworks: string[];
  jurisdiction: string;
  riskLevel: string;
  desiredImprovements: string[];
  excludeTemplates?: string[];
  maxSuggestions?: number;
}

export interface ClauseTemplateMatch {
  template: ClauseTemplate;
  similarity: number;
  matchingSections: {
    start: number;
    end: number;
    content: string;
  }[];
  suggestedReplacements: {
    original: string;
    replacement: string;
    reasoning: string;
  }[];
}
