import { ComplianceRule, ComplianceFramework, RiskLevel } from '@/types/compliance';
import { ClauseCategory } from '@/types/clause-library';

// GDPR Compliance Rules
export const GDPR_RULES: ComplianceRule[] = [
  {
    id: 'gdpr-data-subject-rights',
    framework: 'GDPR',
    category: 'DATA_PROTECTION',
    name: 'Data Subject Rights',
    description: 'Contract must include provisions for data subject rights (access, rectification, erasure, portability)',
    riskLevel: 'HIGH',
    keywords: ['data subject', 'right to access', 'right to rectification', 'right to erasure', 'data portability', 'consent withdrawal'],
    patterns: [
      /right to access/i,
      /right to rectification/i,
      /right to erasure/i,
      /data portability/i,
      /consent withdrawal/i,
      /data subject rights/i
    ],
    weight: 0.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'gdpr-lawful-basis',
    framework: 'GDPR',
    category: 'CONSENT_MANAGEMENT',
    name: 'Lawful Basis for Processing',
    description: 'Contract must specify lawful basis for data processing',
    riskLevel: 'CRITICAL',
    keywords: ['lawful basis', 'legitimate interest', 'consent', 'contractual necessity', 'legal obligation'],
    patterns: [
      /lawful basis/i,
      /legitimate interest/i,
      /contractual necessity/i,
      /legal obligation/i,
      /vital interests/i
    ],
    weight: 1.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'gdpr-data-retention',
    framework: 'GDPR',
    category: 'DATA_RETENTION',
    name: 'Data Retention Periods',
    description: 'Contract must specify data retention periods and deletion procedures',
    riskLevel: 'HIGH',
    keywords: ['retention period', 'data deletion', 'storage limitation', 'retention policy'],
    patterns: [
      /retention period/i,
      /data deletion/i,
      /storage limitation/i,
      /retention policy/i,
      /data retention/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'gdpr-cross-border',
    framework: 'GDPR',
    category: 'CROSS_BORDER_TRANSFER',
    name: 'Cross-Border Data Transfers',
    description: 'Contract must include safeguards for international data transfers',
    riskLevel: 'HIGH',
    keywords: ['cross-border', 'international transfer', 'adequacy decision', 'standard contractual clauses', 'binding corporate rules'],
    patterns: [
      /cross-border/i,
      /international transfer/i,
      /adequacy decision/i,
      /standard contractual clauses/i,
      /binding corporate rules/i,
      /sccs/i
    ],
    weight: 0.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'gdpr-breach-notification',
    framework: 'GDPR',
    category: 'BREACH_NOTIFICATION',
    name: 'Data Breach Notification',
    description: 'Contract must include data breach notification requirements',
    riskLevel: 'HIGH',
    keywords: ['breach notification', 'data breach', 'security incident', '72 hours', 'supervisory authority'],
    patterns: [
      /breach notification/i,
      /data breach/i,
      /security incident/i,
      /72 hours/i,
      /supervisory authority/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// HIPAA Compliance Rules
export const HIPAA_RULES: ComplianceRule[] = [
  {
    id: 'hipaa-phi-protection',
    framework: 'HIPAA',
    category: 'HEALTHCARE_PRIVACY',
    name: 'PHI Protection Requirements',
    description: 'Contract must include specific protections for Protected Health Information',
    riskLevel: 'CRITICAL',
    keywords: ['PHI', 'protected health information', 'health information', 'medical records', 'patient data'],
    patterns: [
      /protected health information/i,
      /PHI/i,
      /health information/i,
      /medical records/i,
      /patient data/i
    ],
    weight: 1.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hipaa-baa-requirement',
    framework: 'HIPAA',
    category: 'HEALTHCARE_PRIVACY',
    name: 'Business Associate Agreement',
    description: 'Contract must include Business Associate Agreement provisions',
    riskLevel: 'CRITICAL',
    keywords: ['business associate', 'BAA', 'covered entity', 'HIPAA compliance', 'healthcare data'],
    patterns: [
      /business associate/i,
      /BAA/i,
      /covered entity/i,
      /HIPAA compliance/i,
      /healthcare data/i
    ],
    weight: 1.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hipaa-minimum-necessary',
    framework: 'HIPAA',
    category: 'HEALTHCARE_PRIVACY',
    name: 'Minimum Necessary Standard',
    description: 'Contract must limit access to minimum necessary information',
    riskLevel: 'HIGH',
    keywords: ['minimum necessary', 'need to know', 'access limitation', 'data minimization'],
    patterns: [
      /minimum necessary/i,
      /need to know/i,
      /access limitation/i,
      /data minimization/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// SOX Compliance Rules
export const SOX_RULES: ComplianceRule[] = [
  {
    id: 'sox-financial-reporting',
    framework: 'SOX',
    category: 'FINANCIAL_REPORTING',
    name: 'Financial Reporting Controls',
    description: 'Contract must include internal controls for financial reporting',
    riskLevel: 'CRITICAL',
    keywords: ['internal controls', 'financial reporting', 'audit trail', 'documentation', 'SOX compliance'],
    patterns: [
      /internal controls/i,
      /financial reporting/i,
      /audit trail/i,
      /SOX compliance/i,
      /sarbanes-oxley/i
    ],
    weight: 1.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sox-audit-requirements',
    framework: 'SOX',
    category: 'AUDIT_COMPLIANCE',
    name: 'Audit Requirements',
    description: 'Contract must include audit and review requirements',
    riskLevel: 'HIGH',
    keywords: ['audit', 'review', 'assessment', 'compliance monitoring', 'internal audit'],
    patterns: [
      /audit requirements/i,
      /compliance monitoring/i,
      /internal audit/i,
      /external audit/i,
      /audit trail/i
    ],
    weight: 0.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sox-documentation',
    framework: 'SOX',
    category: 'AUDIT_COMPLIANCE',
    name: 'Documentation Requirements',
    description: 'Contract must include proper documentation and record-keeping requirements',
    riskLevel: 'HIGH',
    keywords: ['documentation', 'record keeping', 'evidence', 'supporting documents', 'retention'],
    patterns: [
      /documentation requirements/i,
      /record keeping/i,
      /supporting documents/i,
      /evidence/i,
      /retention/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// CCPA Compliance Rules
export const CCPA_RULES: ComplianceRule[] = [
  {
    id: 'ccpa-consumer-rights',
    framework: 'CCPA',
    category: 'CONSUMER_RIGHTS',
    name: 'Consumer Rights',
    description: 'Contract must include California Consumer Privacy Act consumer rights',
    riskLevel: 'HIGH',
    keywords: ['consumer rights', 'opt-out', 'do not sell', 'personal information', 'CCPA'],
    patterns: [
      /consumer rights/i,
      /opt-out/i,
      /do not sell/i,
      /personal information/i,
      /CCPA/i,
      /california consumer privacy/i
    ],
    weight: 0.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ccpa-disclosure',
    framework: 'CCPA',
    category: 'CONSUMER_RIGHTS',
    name: 'Information Disclosure',
    description: 'Contract must include proper disclosure of data collection and use',
    riskLevel: 'HIGH',
    keywords: ['disclosure', 'data collection', 'privacy notice', 'transparency', 'information practices'],
    patterns: [
      /disclosure/i,
      /data collection/i,
      /privacy notice/i,
      /transparency/i,
      /information practices/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ISO 27001 Compliance Rules
export const ISO27001_RULES: ComplianceRule[] = [
  {
    id: 'iso27001-security-policy',
    framework: 'ISO27001',
    category: 'SECURITY_REQUIREMENTS',
    name: 'Information Security Policy',
    description: 'Contract must include information security policy requirements',
    riskLevel: 'HIGH',
    keywords: ['information security', 'security policy', 'ISO 27001', 'ISMS', 'security controls'],
    patterns: [
      /information security/i,
      /security policy/i,
      /ISO 27001/i,
      /ISMS/i,
      /security controls/i
    ],
    weight: 0.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'iso27001-risk-assessment',
    framework: 'ISO27001',
    category: 'SECURITY_REQUIREMENTS',
    name: 'Risk Assessment',
    description: 'Contract must include risk assessment and management requirements',
    riskLevel: 'HIGH',
    keywords: ['risk assessment', 'risk management', 'threat analysis', 'vulnerability assessment'],
    patterns: [
      /risk assessment/i,
      /risk management/i,
      /threat analysis/i,
      /vulnerability assessment/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// SOC 2 Compliance Rules
export const SOC2_RULES: ComplianceRule[] = [
  {
    id: 'soc2-availability',
    framework: 'SOC2',
    category: 'SECURITY_REQUIREMENTS',
    name: 'System Availability',
    description: 'Contract must include system availability and uptime requirements',
    riskLevel: 'MEDIUM',
    keywords: ['availability', 'uptime', 'system reliability', 'service level', 'SLA'],
    patterns: [
      /availability/i,
      /uptime/i,
      /system reliability/i,
      /service level/i,
      /SLA/i
    ],
    weight: 0.6,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'soc2-confidentiality',
    framework: 'SOC2',
    category: 'CONFIDENTIALITY',
    name: 'Confidentiality Controls',
    description: 'Contract must include confidentiality and data protection controls',
    riskLevel: 'HIGH',
    keywords: ['confidentiality', 'data protection', 'access controls', 'encryption', 'SOC 2'],
    patterns: [
      /confidentiality/i,
      /data protection/i,
      /access controls/i,
      /encryption/i,
      /SOC 2/i
    ],
    weight: 0.8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// PCI DSS Compliance Rules
export const PCI_DSS_RULES: ComplianceRule[] = [
  {
    id: 'pci-dss-card-data',
    framework: 'PCI-DSS',
    category: 'SECURITY_REQUIREMENTS',
    name: 'Cardholder Data Protection',
    description: 'Contract must include protection for cardholder data',
    riskLevel: 'CRITICAL',
    keywords: ['cardholder data', 'credit card', 'payment data', 'PCI DSS', 'card security'],
    patterns: [
      /cardholder data/i,
      /credit card/i,
      /payment data/i,
      /PCI DSS/i,
      /card security/i
    ],
    weight: 1.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pci-dss-encryption',
    framework: 'PCI-DSS',
    category: 'SECURITY_REQUIREMENTS',
    name: 'Data Encryption',
    description: 'Contract must include encryption requirements for sensitive data',
    riskLevel: 'HIGH',
    keywords: ['encryption', 'encrypted', 'cryptographic', 'data security', 'secure transmission'],
    patterns: [
      /encryption/i,
      /encrypted/i,
      /cryptographic/i,
      /data security/i,
      /secure transmission/i
    ],
    weight: 0.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Combine all rules
export const ALL_COMPLIANCE_RULES: ComplianceRule[] = [
  ...GDPR_RULES,
  ...HIPAA_RULES,
  ...SOX_RULES,
  ...CCPA_RULES,
  ...ISO27001_RULES,
  ...SOC2_RULES,
  ...PCI_DSS_RULES
];

// Risk level weights for scoring
export const RISK_LEVEL_WEIGHTS: Record<RiskLevel, number> = {
  'LOW': 0.2,
  'MEDIUM': 0.5,
  'HIGH': 0.8,
  'CRITICAL': 1.0
};

// Framework priority weights
export const FRAMEWORK_WEIGHTS: Record<ComplianceFramework, number> = {
  'GDPR': 0.9,
  'HIPAA': 0.9,
  'SOX': 0.8,
  'CCPA': 0.7,
  'PIPEDA': 0.7,
  'LGPD': 0.7,
  'ISO27001': 0.6,
  'SOC2': 0.6,
  'PCI-DSS': 0.8,
  'CUSTOM': 0.5
};
