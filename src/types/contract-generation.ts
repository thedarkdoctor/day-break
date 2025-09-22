export type ContractType = 
  | 'SERVICE_AGREEMENT'
  | 'DATA_PROCESSING_AGREEMENT'
  | 'NON_DISCLOSURE_AGREEMENT'
  | 'MERGER_AGREEMENT'
  | 'EMPLOYMENT_CONTRACT'
  | 'LICENSING_AGREEMENT'
  | 'PURCHASE_AGREEMENT'
  | 'CONSULTING_AGREEMENT'
  | 'PARTNERSHIP_AGREEMENT'
  | 'DISTRIBUTION_AGREEMENT'
  | 'CUSTOM';

export type FieldType = 
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'CURRENCY'
  | 'BOOLEAN'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'TEXTAREA'
  | 'EMAIL'
  | 'PHONE'
  | 'ADDRESS'
  | 'PERSON'
  | 'COMPANY'
  | 'CLAUSE_REFERENCE';

export type FieldValidation = {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidation?: string;
};

export type FieldOption = {
  value: string;
  label: string;
  description?: string;
  isDefault?: boolean;
};

export interface ContractField {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: FieldType;
  validation: FieldValidation;
  options?: FieldOption[];
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  isVisible: boolean;
  isEditable: boolean;
  order: number;
  category: string;
  tags: string[];
  dependencies?: FieldDependency[];
  autoFill?: AutoFillRule;
}

export interface FieldDependency {
  fieldId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'set_value';
  targetValue?: any;
}

export interface AutoFillRule {
  source: 'CRM' | 'PAST_DEALS' | 'TEMPLATE' | 'USER_PREFERENCES' | 'CALCULATED';
  fieldMapping: string;
  calculation?: string;
  fallbackValue?: any;
  conditions?: AutoFillCondition[];
}

export interface AutoFillCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: any;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: ContractType;
  category: string;
  version: string;
  isActive: boolean;
  isPublic: boolean;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;
  fields: ContractField[];
  content: string;
  variables: string[];
  metadata: {
    wordCount: number;
    complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
    estimatedTime: number; // in minutes
    requiredFields: number;
    optionalFields: number;
    tags: string[];
    jurisdictions: string[];
    practiceAreas: string[];
  };
  settings: {
    allowCustomFields: boolean;
    requireApproval: boolean;
    autoSave: boolean;
    versionControl: boolean;
    notifications: boolean;
  };
}

export interface ContractGenerationRequest {
  templateId: string;
  fieldValues: Record<string, any>;
  clientId?: string;
  dealId?: string;
  customFields?: ContractField[];
  preferences: {
    language: string;
    jurisdiction: string;
    format: 'DOCX' | 'PDF' | 'HTML' | 'TEXT';
    includeComments: boolean;
    includeTrackChanges: boolean;
  };
  metadata: {
    generatedBy: string;
    generatedAt: Date;
    purpose: string;
    notes?: string;
  };
}

export interface GeneratedContract {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  fieldValues: Record<string, any>;
  metadata: {
    generatedBy: string;
    generatedAt: Date;
    clientId?: string;
    dealId?: string;
    wordCount: number;
    pageCount: number;
    fileSize: number;
    format: string;
    version: string;
  };
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SIGNED' | 'ARCHIVED';
  approval?: {
    approvedBy?: string;
    approvedAt?: Date;
    comments?: string;
  };
  signing?: {
    signedBy?: string[];
    signedAt?: Date[];
    signatureMethod?: string;
  };
  files: {
    original: string;
    pdf?: string;
    docx?: string;
    html?: string;
  };
}

export interface CRMData {
  clientId: string;
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  industry: string;
  companySize: string;
  preferences: {
    language: string;
    currency: string;
    timezone: string;
  };
  customFields: Record<string, any>;
  lastInteraction: Date;
  dealHistory: DealSummary[];
}

export interface DealSummary {
  dealId: string;
  dealName: string;
  type: ContractType;
  value: number;
  currency: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  keyTerms: Record<string, any>;
  parties: {
    client: string;
    vendor: string;
    additionalParties?: string[];
  };
}

export interface ContractBuilderState {
  template: ContractTemplate | null;
  fieldValues: Record<string, any>;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  autoFillData: Record<string, any>;
  suggestions: FieldSuggestion[];
  progress: number;
}

export interface FieldSuggestion {
  fieldId: string;
  suggestion: any;
  confidence: number;
  source: 'CRM' | 'PAST_DEALS' | 'TEMPLATE' | 'AI';
  reasoning: string;
  alternatives?: any[];
}

export interface ContractValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  fieldId: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
  suggestion?: string;
}

export interface ValidationWarning {
  fieldId: string;
  message: string;
  suggestion?: string;
}

export interface ValidationSuggestion {
  fieldId: string;
  message: string;
  suggestedValue: any;
  reasoning: string;
}

export interface TemplateLibrary {
  id: string;
  name: string;
  description: string;
  templates: ContractTemplate[];
  categories: string[];
  tags: string[];
  isPublic: boolean;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationSettings {
  autoFill: {
    enabled: boolean;
    sources: ('CRM' | 'PAST_DEALS' | 'TEMPLATE' | 'USER_PREFERENCES')[];
    confidenceThreshold: number;
  };
  validation: {
    enabled: boolean;
    strictMode: boolean;
    autoFix: boolean;
  };
  output: {
    defaultFormat: 'DOCX' | 'PDF' | 'HTML' | 'TEXT';
    includeMetadata: boolean;
    includeComments: boolean;
    watermark: boolean;
  };
  notifications: {
    onGeneration: boolean;
    onErrors: boolean;
    onApproval: boolean;
  };
}

export interface ContractGenerationStats {
  totalGenerated: number;
  templatesUsed: Record<string, number>;
  averageGenerationTime: number;
  successRate: number;
  commonErrors: string[];
  popularTemplates: ContractTemplate[];
  userStats: Record<string, {
    generated: number;
    templates: string[];
    averageTime: number;
  }>;
}

export interface ContractPreview {
  id: string;
  content: string;
  fieldValues: Record<string, any>;
  metadata: {
    templateName: string;
    generatedAt: Date;
    wordCount: number;
    estimatedPages: number;
  };
  sections: ContractSection[];
  variables: ContractVariable[];
}

export interface ContractSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
  variables: string[];
}

export interface ContractVariable {
  name: string;
  value: any;
  type: FieldType;
  isResolved: boolean;
  source: string;
  position: {
    start: number;
    end: number;
  };
}
