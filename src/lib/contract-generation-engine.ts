import {
  ContractTemplate,
  ContractField,
  ContractGenerationRequest,
  GeneratedContract,
  CRMData,
  DealSummary,
  ContractBuilderState,
  FieldSuggestion,
  ContractValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  GenerationSettings,
  ContractPreview,
  ContractSection,
  ContractVariable,
  FieldType,
  AutoFillRule
} from '@/types/contract-generation';

export class ContractGenerationEngine {
  private templates: Map<string, ContractTemplate> = new Map();
  private crmData: Map<string, CRMData> = new Map();
  private dealHistory: Map<string, DealSummary[]> = new Map();
  private settings: GenerationSettings;

  constructor() {
    this.settings = this.getDefaultSettings();
    this.initializeSampleData();
  }

  /**
   * Generate a contract from a template and field values
   */
  async generateContract(request: ContractGenerationRequest): Promise<GeneratedContract> {
    const template = this.templates.get(request.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Validate field values
    const validation = this.validateFieldValues(template, request.fieldValues);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Process template content
    const processedContent = await this.processTemplate(template, request.fieldValues);

    // Generate contract ID
    const contractId = this.generateContractId();

    // Create generated contract
    const generatedContract: GeneratedContract = {
      id: contractId,
      templateId: request.templateId,
      templateName: template.name,
      content: processedContent,
      fieldValues: request.fieldValues,
      metadata: {
        generatedBy: request.metadata.generatedBy,
        generatedAt: request.metadata.generatedAt,
        clientId: request.clientId,
        dealId: request.dealId,
        wordCount: this.countWords(processedContent),
        pageCount: this.estimatePages(processedContent),
        fileSize: this.calculateFileSize(processedContent),
        format: request.preferences.format,
        version: template.version
      },
      status: 'DRAFT',
      files: {
        original: `${contractId}.txt`
      }
    };

    return generatedContract;
  }

  /**
   * Get contract preview with field values
   */
  async getContractPreview(
    templateId: string,
    fieldValues: Record<string, any>
  ): Promise<ContractPreview> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const processedContent = await this.processTemplate(template, fieldValues);
    const sections = this.extractSections(processedContent);
    const variables = this.extractVariables(template, fieldValues);

    return {
      id: `preview-${Date.now()}`,
      content: processedContent,
      fieldValues,
      metadata: {
        templateName: template.name,
        generatedAt: new Date(),
        wordCount: this.countWords(processedContent),
        estimatedPages: this.estimatePages(processedContent)
      },
      sections,
      variables
    };
  }

  /**
   * Get field suggestions based on CRM data and past deals
   */
  getFieldSuggestions(
    templateId: string,
    fieldId: string,
    clientId?: string,
    dealId?: string
  ): FieldSuggestion[] {
    const template = this.templates.get(templateId);
    if (!template) {
      return [];
    }

    const field = template.fields.find(f => f.id === fieldId);
    if (!field) {
      return [];
    }

    const suggestions: FieldSuggestion[] = [];

    // Get suggestions from CRM data
    if (clientId && this.crmData.has(clientId)) {
      const crmData = this.crmData.get(clientId)!;
      const suggestion = this.getCRMSuggestion(field, crmData);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Get suggestions from past deals
    if (clientId && this.dealHistory.has(clientId)) {
      const deals = this.dealHistory.get(clientId)!;
      const dealSuggestions = this.getDealSuggestions(field, deals);
      suggestions.push(...dealSuggestions);
    }

    // Get suggestions from template defaults
    if (field.defaultValue) {
      suggestions.push({
        fieldId,
        suggestion: field.defaultValue,
        confidence: 0.8,
        source: 'TEMPLATE',
        reasoning: 'Default value from template'
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Auto-fill fields based on CRM data and past deals
   */
  autoFillFields(
    templateId: string,
    clientId?: string,
    dealId?: string
  ): Record<string, any> {
    const template = this.templates.get(templateId);
    if (!template) {
      return {};
    }

    const autoFilledValues: Record<string, any> = {};

    for (const field of template.fields) {
      if (field.autoFill) {
        const value = this.getAutoFillValue(field, clientId, dealId);
        if (value !== undefined) {
          autoFilledValues[field.id] = value;
        }
      }
    }

    return autoFilledValues;
  }

  /**
   * Validate field values against template requirements
   */
  validateFieldValues(
    template: ContractTemplate,
    fieldValues: Record<string, any>
  ): ContractValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    for (const field of template.fields) {
      const value = fieldValues[field.id];
      const fieldValidation = this.validateField(field, value);

      if (fieldValidation.errors.length > 0) {
        errors.push(...fieldValidation.errors);
      }

      if (fieldValidation.warnings.length > 0) {
        warnings.push(...fieldValidation.warnings);
      }

      if (fieldValidation.suggestions.length > 0) {
        suggestions.push(...fieldValidation.suggestions);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Get available templates
   */
  getTemplates(category?: string, tags?: string[]): ContractTemplate[] {
    let templates = Array.from(this.templates.values());

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (tags && tags.length > 0) {
      templates = templates.filter(t => 
        tags.some(tag => t.tags.includes(tag))
      );
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Create a new template
   */
  createTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): ContractTemplate {
    const newTemplate: ContractTemplate = {
      ...template,
      id: this.generateTemplateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  /**
   * Update template usage count
   */
  updateTemplateUsage(templateId: string): void {
    const template = this.templates.get(templateId);
    if (template) {
      template.usageCount++;
      template.lastUsed = new Date();
      template.updatedAt = new Date();
    }
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(): any {
    const templates = Array.from(this.templates.values());
    const totalGenerated = templates.reduce((sum, t) => sum + t.usageCount, 0);
    const averageGenerationTime = 2.5; // Placeholder

    return {
      totalGenerated,
      templatesUsed: Object.fromEntries(
        templates.map(t => [t.name, t.usageCount])
      ),
      averageGenerationTime,
      successRate: 0.95, // Placeholder
      commonErrors: [
        'Missing required field',
        'Invalid date format',
        'Invalid email format'
      ],
      popularTemplates: templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
    };
  }

  // Private helper methods
  private async processTemplate(
    template: ContractTemplate,
    fieldValues: Record<string, any>
  ): Promise<string> {
    let content = template.content;

    // Replace variables with field values
    for (const [fieldId, value] of Object.entries(fieldValues)) {
      const field = template.fields.find(f => f.id === fieldId);
      if (field) {
        const placeholder = `{{${field.name}}}`;
        const formattedValue = this.formatFieldValue(field, value);
        content = content.replace(new RegExp(placeholder, 'g'), formattedValue);
      }
    }

    // Replace any remaining unresolved variables
    content = content.replace(/\{\{([^}]+)\}\}/g, '[UNRESOLVED: $1]');

    return content;
  }

  private formatFieldValue(field: ContractField, value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (field.type) {
      case 'DATE':
        return new Date(value).toLocaleDateString();
      case 'CURRENCY':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'BOOLEAN':
        return value ? 'Yes' : 'No';
      case 'TEXTAREA':
        return value.toString().replace(/\n/g, '<br>');
      default:
        return value.toString();
    }
  }

  private validateField(field: ContractField, value: any): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Required field validation
    if (field.validation.required && (value === null || value === undefined || value === '')) {
      errors.push({
        fieldId: field.id,
        message: `${field.label} is required`,
        severity: 'ERROR',
        suggestion: 'Please provide a value for this field'
      });
    }

    // Type-specific validation
    if (value !== null && value !== undefined && value !== '') {
      switch (field.type) {
        case 'EMAIL':
          if (!this.isValidEmail(value)) {
            errors.push({
              fieldId: field.id,
              message: 'Invalid email format',
              severity: 'ERROR',
              suggestion: 'Please enter a valid email address'
            });
          }
          break;
        case 'PHONE':
          if (!this.isValidPhone(value)) {
            warnings.push({
              fieldId: field.id,
              message: 'Phone number format may be invalid',
              suggestion: 'Please check the phone number format'
            });
          }
          break;
        case 'NUMBER':
          if (isNaN(Number(value))) {
            errors.push({
              fieldId: field.id,
              message: 'Must be a valid number',
              severity: 'ERROR'
            });
          } else {
            const numValue = Number(value);
            if (field.validation.min !== undefined && numValue < field.validation.min) {
              errors.push({
                fieldId: field.id,
                message: `Value must be at least ${field.validation.min}`,
                severity: 'ERROR'
              });
            }
            if (field.validation.max !== undefined && numValue > field.validation.max) {
              errors.push({
                fieldId: field.id,
                message: `Value must be at most ${field.validation.max}`,
                severity: 'ERROR'
              });
            }
          }
          break;
        case 'TEXT':
          const textValue = value.toString();
          if (field.validation.minLength && textValue.length < field.validation.minLength) {
            errors.push({
              fieldId: field.id,
              message: `Must be at least ${field.validation.minLength} characters`,
              severity: 'ERROR'
            });
          }
          if (field.validation.maxLength && textValue.length > field.validation.maxLength) {
            warnings.push({
              fieldId: field.id,
              message: `Consider shortening to ${field.validation.maxLength} characters`,
              suggestion: 'Long text may affect readability'
            });
          }
          break;
      }
    }

    return { errors, warnings, suggestions };
  }

  private getCRMSuggestion(field: ContractField, crmData: CRMData): FieldSuggestion | null {
    const mapping = this.getFieldMapping(field.name);
    if (!mapping) return null;

    let value: any;
    let confidence = 0.9;

    switch (mapping) {
      case 'clientName':
        value = crmData.clientName;
        break;
      case 'contactPerson':
        value = crmData.contactPerson;
        break;
      case 'email':
        value = crmData.email;
        break;
      case 'phone':
        value = crmData.phone;
        break;
      case 'address':
        value = `${crmData.address.street}, ${crmData.address.city}, ${crmData.address.state} ${crmData.address.zipCode}`;
        break;
      case 'industry':
        value = crmData.industry;
        confidence = 0.7;
        break;
      default:
        return null;
    }

    return {
      fieldId: field.id,
      suggestion: value,
      confidence,
      source: 'CRM',
      reasoning: `Auto-filled from CRM data for ${crmData.clientName}`
    };
  }

  private getDealSuggestions(field: ContractField, deals: DealSummary[]): FieldSuggestion[] {
    const suggestions: FieldSuggestion[] = [];
    const recentDeals = deals.slice(0, 5); // Last 5 deals

    for (const deal of recentDeals) {
      const mapping = this.getFieldMapping(field.name);
      if (!mapping) continue;

      let value: any;
      let confidence = 0.6;

      switch (mapping) {
        case 'contractValue':
          value = deal.value;
          confidence = 0.8;
          break;
        case 'currency':
          value = deal.currency;
          confidence = 0.9;
          break;
        case 'startDate':
          value = deal.startDate;
          confidence = 0.7;
          break;
        case 'endDate':
          value = deal.endDate;
          confidence = 0.6;
          break;
        default:
          if (deal.keyTerms && deal.keyTerms[mapping]) {
            value = deal.keyTerms[mapping];
            confidence = 0.5;
          }
      }

      if (value !== undefined) {
        suggestions.push({
          fieldId: field.id,
          suggestion: value,
          confidence,
          source: 'PAST_DEALS',
          reasoning: `Based on similar deal: ${deal.dealName}`
        });
      }
    }

    return suggestions;
  }

  private getAutoFillValue(field: ContractField, clientId?: string, dealId?: string): any {
    if (!field.autoFill) return undefined;

    const rule = field.autoFill;
    let value: any;

    switch (rule.source) {
      case 'CRM':
        if (clientId && this.crmData.has(clientId)) {
          const crmData = this.crmData.get(clientId)!;
          value = this.getCRMValue(rule.fieldMapping, crmData);
        }
        break;
      case 'PAST_DEALS':
        if (clientId && this.dealHistory.has(clientId)) {
          const deals = this.dealHistory.get(clientId)!;
          value = this.getDealValue(rule.fieldMapping, deals);
        }
        break;
      case 'TEMPLATE':
        value = field.defaultValue;
        break;
      case 'USER_PREFERENCES':
        // Would get from user preferences
        value = rule.fallbackValue;
        break;
      case 'CALCULATED':
        if (rule.calculation) {
          value = this.calculateValue(rule.calculation, {});
        }
        break;
    }

    // Apply conditions
    if (rule.conditions && value !== undefined) {
      for (const condition of rule.conditions) {
        // Would check conditions here
      }
    }

    return value || rule.fallbackValue;
  }

  private getFieldMapping(fieldName: string): string | null {
    const mappings: Record<string, string> = {
      'client_name': 'clientName',
      'client_name': 'clientName',
      'contact_person': 'contactPerson',
      'contact_email': 'email',
      'contact_phone': 'phone',
      'client_address': 'address',
      'industry': 'industry',
      'contract_value': 'contractValue',
      'currency': 'currency',
      'start_date': 'startDate',
      'end_date': 'endDate'
    };

    return mappings[fieldName.toLowerCase()] || null;
  }

  private getCRMValue(mapping: string, crmData: CRMData): any {
    switch (mapping) {
      case 'clientName': return crmData.clientName;
      case 'contactPerson': return crmData.contactPerson;
      case 'email': return crmData.email;
      case 'phone': return crmData.phone;
      case 'address': return crmData.address;
      case 'industry': return crmData.industry;
      default: return crmData.customFields[mapping];
    }
  }

  private getDealValue(mapping: string, deals: DealSummary[]): any {
    if (deals.length === 0) return undefined;

    const latestDeal = deals[0];
    switch (mapping) {
      case 'contractValue': return latestDeal.value;
      case 'currency': return latestDeal.currency;
      case 'startDate': return latestDeal.startDate;
      case 'endDate': return latestDeal.endDate;
      default: return latestDeal.keyTerms[mapping];
    }
  }

  private calculateValue(calculation: string, context: Record<string, any>): any {
    // Simple calculation engine - would be more sophisticated in production
    try {
      // Replace variables in calculation
      let expr = calculation;
      for (const [key, value] of Object.entries(context)) {
        expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      }
      return eval(expr);
    } catch {
      return undefined;
    }
  }

  private extractSections(content: string): ContractSection[] {
    // Simple section extraction - would be more sophisticated in production
    const sections: ContractSection[] = [];
    const lines = content.split('\n');
    let currentSection: ContractSection | null = null;
    let order = 0;

    for (const line of lines) {
      if (line.match(/^#+\s/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          id: `section-${order}`,
          title: line.replace(/^#+\s/, ''),
          content: '',
          order: order++,
          isRequired: true,
          variables: []
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private extractVariables(template: ContractTemplate, fieldValues: Record<string, any>): ContractVariable[] {
    const variables: ContractVariable[] = [];

    for (const [fieldId, value] of Object.entries(fieldValues)) {
      const field = template.fields.find(f => f.id === fieldId);
      if (field) {
        variables.push({
          name: field.name,
          value,
          type: field.type,
          isResolved: true,
          source: 'USER_INPUT',
          position: { start: 0, end: 0 } // Would calculate actual position
        });
      }
    }

    return variables;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimatePages(text: string): number {
    const wordsPerPage = 250;
    return Math.ceil(this.countWords(text) / wordsPerPage);
  }

  private calculateFileSize(text: string): number {
    return new Blob([text]).size;
  }

  private generateContractId(): string {
    return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultSettings(): GenerationSettings {
    return {
      autoFill: {
        enabled: true,
        sources: ['CRM', 'PAST_DEALS', 'TEMPLATE'],
        confidenceThreshold: 0.7
      },
      validation: {
        enabled: true,
        strictMode: false,
        autoFix: true
      },
      output: {
        defaultFormat: 'DOCX',
        includeMetadata: true,
        includeComments: false,
        watermark: false
      },
      notifications: {
        onGeneration: true,
        onErrors: true,
        onApproval: false
      }
    };
  }

  private initializeSampleData(): void {
    // Initialize sample templates
    this.initializeSampleTemplates();
    
    // Initialize sample CRM data
    this.initializeSampleCRMData();
    
    // Initialize sample deal history
    this.initializeSampleDealHistory();
  }

  private initializeSampleTemplates(): void {
    const templates: ContractTemplate[] = [
      {
        id: 'template-1',
        name: 'Service Agreement',
        description: 'Standard service agreement template',
        type: 'SERVICE_AGREEMENT',
        category: 'Commercial',
        version: '1.0',
        isActive: true,
        isPublic: true,
        author: 'System',
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 15,
        fields: [
          {
            id: 'client_name',
            name: 'client_name',
            label: 'Client Name',
            type: 'TEXT',
            validation: { required: true },
            isVisible: true,
            isEditable: true,
            order: 1,
            category: 'Parties',
            tags: ['client', 'party'],
            autoFill: {
              source: 'CRM',
              fieldMapping: 'clientName'
            }
          },
          {
            id: 'service_description',
            name: 'service_description',
            label: 'Service Description',
            type: 'TEXTAREA',
            validation: { required: true, minLength: 10 },
            isVisible: true,
            isEditable: true,
            order: 2,
            category: 'Services',
            tags: ['service', 'description']
          },
          {
            id: 'contract_value',
            name: 'contract_value',
            label: 'Contract Value',
            type: 'CURRENCY',
            validation: { required: true, min: 0 },
            isVisible: true,
            isEditable: true,
            order: 3,
            category: 'Financial',
            tags: ['value', 'price'],
            autoFill: {
              source: 'PAST_DEALS',
              fieldMapping: 'contractValue'
            }
          }
        ],
        content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {{start_date}} between {{client_name}} ("Client") and {{company_name}} ("Service Provider").

1. SERVICES
{{service_description}}

2. COMPENSATION
The total compensation for the services shall be {{contract_value}}.

3. TERM
This Agreement shall commence on {{start_date}} and continue until {{end_date}}.

4. TERMINATION
Either party may terminate this Agreement with 30 days written notice.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Client: _________________    Service Provider: _________________
Date: _________________      Date: _________________`,
        variables: ['client_name', 'service_description', 'contract_value', 'start_date', 'end_date', 'company_name'],
        metadata: {
          wordCount: 150,
          complexity: 'SIMPLE',
          estimatedTime: 5,
          requiredFields: 3,
          optionalFields: 2,
          tags: ['service', 'agreement', 'commercial'],
          jurisdictions: ['US'],
          practiceAreas: ['Commercial Law']
        },
        settings: {
          allowCustomFields: true,
          requireApproval: false,
          autoSave: true,
          versionControl: true,
          notifications: true
        }
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeSampleCRMData(): void {
    const crmData: CRMData[] = [
      {
        clientId: 'client-1',
        clientName: 'Acme Corporation',
        contactPerson: 'John Smith',
        email: 'john.smith@acme.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        industry: 'Technology',
        companySize: 'Large',
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'EST'
        },
        customFields: {
          'annual_revenue': 50000000,
          'employee_count': 500
        },
        lastInteraction: new Date(),
        dealHistory: []
      }
    ];

    crmData.forEach(data => {
      this.crmData.set(data.clientId, data);
    });
  }

  private initializeSampleDealHistory(): void {
    const dealHistory: Record<string, DealSummary[]> = {
      'client-1': [
        {
          dealId: 'deal-1',
          dealName: 'Software Development Agreement',
          type: 'SERVICE_AGREEMENT',
          value: 150000,
          currency: 'USD',
          status: 'Completed',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-06-30'),
          keyTerms: {
            'payment_terms': 'Net 30',
            'deliverables': 'Custom software solution'
          },
          parties: {
            client: 'Acme Corporation',
            vendor: 'Tech Solutions Inc'
          }
        }
      ]
    };

    Object.entries(dealHistory).forEach(([clientId, deals]) => {
      this.dealHistory.set(clientId, deals);
    });
  }
}
