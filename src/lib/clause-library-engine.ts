import {
  ClauseTemplate,
  ClauseVersion,
  ClauseSuggestion,
  ClauseLibrary,
  ClauseSearchFilters,
  ClauseComparison,
  ClauseDifference,
  ClauseUsage,
  ClauseAnalytics,
  SmartSuggestionRequest,
  ClauseTemplateMatch,
  ClauseCategory,
  SuggestionType
} from '@/types/clause-library';

export class ClauseLibraryEngine {
  private libraries: Map<string, ClauseLibrary> = new Map();
  private suggestions: Map<string, ClauseSuggestion> = new Map();
  private usage: Map<string, ClauseUsage> = new Map();

  constructor() {
    this.initializeDefaultLibraries();
  }

  /**
   * Create a new clause library
   */
  createLibrary(
    name: string,
    description: string,
    firmId: string,
    isPublic: boolean = false
  ): ClauseLibrary {
    const library: ClauseLibrary = {
      id: this.generateId(),
      name,
      description,
      firmId,
      isPublic,
      categories: [],
      clauses: [],
      totalClauses: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
      settings: {
        allowPublicSharing: isPublic,
        requireApproval: true,
        autoTagging: true,
        versionControl: true
      }
    };

    this.libraries.set(library.id, library);
    return library;
  }

  /**
   * Add a clause template to a library
   */
  addClauseTemplate(
    libraryId: string,
    template: Omit<ClauseTemplate, 'id' | 'createdAt' | 'lastModified' | 'usageCount'>
  ): ClauseTemplate {
    const library = this.libraries.get(libraryId);
    if (!library) {
      throw new Error('Library not found');
    }

    const clauseTemplate: ClauseTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      lastModified: new Date(),
      usageCount: 0
    };

    library.clauses.push(clauseTemplate);
    library.totalClauses = library.clauses.length;
    library.lastUpdated = new Date();

    // Update categories
    if (!library.categories.includes(template.category)) {
      library.categories.push(template.category);
    }

    return clauseTemplate;
  }

  /**
   * Search clauses with filters
   */
  searchClauses(
    libraryId: string,
    query: string,
    filters: ClauseSearchFilters = {}
  ): ClauseTemplate[] {
    const library = this.libraries.get(libraryId);
    if (!library) {
      return [];
    }

    let results = library.clauses;

    // Text search
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      results = results.filter(clause =>
        searchTerms.every(term =>
          clause.title.toLowerCase().includes(term) ||
          clause.description.toLowerCase().includes(term) ||
          clause.content.toLowerCase().includes(term) ||
          clause.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(clause => filters.categories!.includes(clause.category));
    }

    if (filters.status && filters.status.length > 0) {
      results = results.filter(clause => filters.status!.includes(clause.status));
    }

    if (filters.riskLevel && filters.riskLevel.length > 0) {
      results = results.filter(clause => filters.riskLevel!.includes(clause.riskLevel));
    }

    if (filters.complianceFrameworks && filters.complianceFrameworks.length > 0) {
      results = results.filter(clause =>
        filters.complianceFrameworks!.some(framework =>
          clause.complianceFrameworks.includes(framework)
        )
      );
    }

    if (filters.jurisdiction) {
      results = results.filter(clause => clause.jurisdiction === filters.jurisdiction);
    }

    if (filters.language) {
      results = results.filter(clause => clause.language === filters.language);
    }

    if (filters.author) {
      results = results.filter(clause => clause.author === filters.author);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(clause =>
        filters.tags!.some(tag => clause.tags.includes(tag))
      );
    }

    if (filters.isPublic !== undefined) {
      results = results.filter(clause => clause.isPublic === filters.isPublic);
    }

    if (filters.firmId) {
      results = results.filter(clause => clause.firmId === filters.firmId);
    }

    // Sort by relevance and usage
    return results.sort((a, b) => {
      // First by usage count (descending)
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount;
      }
      // Then by last modified (descending)
      return b.lastModified.getTime() - a.lastModified.getTime();
    });
  }

  /**
   * Generate smart suggestions for a clause
   */
  generateSmartSuggestions(
    request: SmartSuggestionRequest,
    libraryId: string
  ): ClauseSuggestion[] {
    const library = this.libraries.get(libraryId);
    if (!library) {
      return [];
    }

    const suggestions: ClauseSuggestion[] = [];
    const originalClause = request.originalClause;

    // Find similar clauses in the library
    const similarClauses = this.findSimilarClauses(originalClause, library, request);

    // Generate suggestions based on similar clauses
    for (const match of similarClauses) {
      const suggestion = this.createSuggestionFromTemplate(
        originalClause,
        match,
        request
      );
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Generate AI-powered suggestions
    const aiSuggestions = this.generateAISuggestions(request);
    suggestions.push(...aiSuggestions);

    // Sort by confidence and relevance
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, request.maxSuggestions || 5);
  }

  /**
   * Find similar clauses in the library
   */
  private findSimilarClauses(
    originalClause: string,
    library: ClauseLibrary,
    request: SmartSuggestionRequest
  ): ClauseTemplateMatch[] {
    const matches: ClauseTemplateMatch[] = [];
    const originalWords = this.extractKeywords(originalClause);

    for (const clause of library.clauses) {
      if (request.excludeTemplates?.includes(clause.id)) {
        continue;
      }

      // Check category match
      if (clause.category !== request.category) {
        continue;
      }

      // Check compliance framework match
      const hasFrameworkMatch = request.complianceFrameworks.some(framework =>
        clause.complianceFrameworks.includes(framework)
      );

      if (!hasFrameworkMatch) {
        continue;
      }

      // Calculate similarity
      const similarity = this.calculateSimilarity(originalClause, clause.content);
      
      if (similarity > 0.3) { // Minimum similarity threshold
        const matchingSections = this.findMatchingSections(originalClause, clause.content);
        const suggestedReplacements = this.generateReplacements(originalClause, clause.content);

        matches.push({
          template: clause,
          similarity,
          matchingSections,
          suggestedReplacements
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Create suggestion from template match
   */
  private createSuggestionFromTemplate(
    originalClause: string,
    match: ClauseTemplateMatch,
    request: SmartSuggestionRequest
  ): ClauseSuggestion | null {
    if (match.similarity < 0.5) {
      return null;
    }

    const suggestionType: SuggestionType = this.determineSuggestionType(
      originalClause,
      match.template.content,
      request
    );

    return {
      id: this.generateId(),
      originalClause,
      suggestedClause: match.template.content,
      suggestionType,
      title: `Improve ${match.template.title}`,
      description: `Based on similar clause: ${match.template.title}`,
      reasoning: this.generateReasoning(originalClause, match.template.content, suggestionType),
      benefits: this.identifyBenefits(match.template.content, originalClause),
      risks: this.identifyRisks(match.template.content, originalClause),
      complianceImprovements: this.identifyComplianceImprovements(
        match.template.content,
        request.complianceFrameworks
      ),
      confidence: match.similarity,
      source: 'LEGAL_PRECEDENT',
      suggestedBy: 'Clause Library Engine',
      createdAt: new Date(),
      isAccepted: false,
      relatedTemplateId: match.template.id
    };
  }

  /**
   * Generate AI-powered suggestions
   */
  private generateAISuggestions(request: SmartSuggestionRequest): ClauseSuggestion[] {
    const suggestions: ClauseSuggestion[] = [];

    // Generate improvement suggestions
    if (request.desiredImprovements.includes('clarity')) {
      suggestions.push(this.generateClaritySuggestion(request));
    }

    if (request.desiredImprovements.includes('compliance')) {
      suggestions.push(this.generateComplianceSuggestion(request));
    }

    if (request.desiredImprovements.includes('risk_reduction')) {
      suggestions.push(this.generateRiskReductionSuggestion(request));
    }

    return suggestions;
  }

  /**
   * Generate clarity improvement suggestion
   */
  private generateClaritySuggestion(request: SmartSuggestionRequest): ClauseSuggestion {
    const improvedClause = this.improveClarity(request.originalClause);
    
    return {
      id: this.generateId(),
      originalClause: request.originalClause,
      suggestedClause: improvedClause,
      suggestionType: 'CLARITY',
      title: 'Improve Clarity and Readability',
      description: 'Simplified language and improved structure for better understanding',
      reasoning: 'The suggested version uses clearer language, shorter sentences, and better organization to improve readability and reduce ambiguity.',
      benefits: [
        'Improved readability',
        'Reduced ambiguity',
        'Better user understanding',
        'Easier to enforce'
      ],
      risks: [
        'May change legal meaning',
        'Requires legal review'
      ],
      complianceImprovements: [],
      confidence: 0.8,
      source: 'AI_ANALYSIS',
      suggestedBy: 'AI Clause Analyzer',
      createdAt: new Date(),
      isAccepted: false
    };
  }

  /**
   * Generate compliance improvement suggestion
   */
  private generateComplianceSuggestion(request: SmartSuggestionRequest): ClauseSuggestion {
    const complianceClause = this.improveCompliance(
      request.originalClause,
      request.complianceFrameworks,
      request.jurisdiction
    );

    return {
      id: this.generateId(),
      originalClause: request.originalClause,
      suggestedClause: complianceClause,
      suggestionType: 'COMPLIANCE',
      title: 'Enhance Compliance',
      description: `Improved compliance with ${request.complianceFrameworks.join(', ')}`,
      reasoning: `The suggested version includes specific compliance requirements for ${request.complianceFrameworks.join(', ')} in ${request.jurisdiction}.`,
      benefits: [
        'Better regulatory compliance',
        'Reduced legal risk',
        'Clearer obligations',
        'Audit-friendly language'
      ],
      risks: [
        'May increase complexity',
        'Requires ongoing monitoring'
      ],
      complianceImprovements: request.complianceFrameworks,
      confidence: 0.9,
      source: 'AI_ANALYSIS',
      suggestedBy: 'AI Compliance Analyzer',
      createdAt: new Date(),
      isAccepted: false
    };
  }

  /**
   * Generate risk reduction suggestion
   */
  private generateRiskReductionSuggestion(request: SmartSuggestionRequest): ClauseSuggestion {
    const riskReducedClause = this.reduceRisk(request.originalClause, request.riskLevel);

    return {
      id: this.generateId(),
      originalClause: request.originalClause,
      suggestedClause: riskReducedClause,
      suggestionType: 'RISK_REDUCTION',
      title: 'Reduce Legal Risk',
      description: 'Added protective language and risk mitigation measures',
      reasoning: 'The suggested version includes additional protective language, clearer limitations, and risk mitigation measures to reduce potential legal exposure.',
      benefits: [
        'Reduced legal exposure',
        'Better risk allocation',
        'Clearer limitations',
        'Protective language'
      ],
      risks: [
        'May be overly restrictive',
        'Could affect enforceability'
      ],
      complianceImprovements: [],
      confidence: 0.7,
      source: 'AI_ANALYSIS',
      suggestedBy: 'AI Risk Analyzer',
      createdAt: new Date(),
      isAccepted: false
    };
  }

  /**
   * Compare two clauses
   */
  compareClauses(originalClause: string, suggestedClause: string): ClauseComparison {
    const differences = this.findDifferences(originalClause, suggestedClause);
    const overallScore = this.calculateOverallScore(originalClause, suggestedClause, differences);
    const improvements = this.identifyImprovements(differences);
    const concerns = this.identifyConcerns(differences);

    return {
      id: this.generateId(),
      originalClause,
      suggestedClause,
      differences,
      overallScore,
      improvements,
      concerns,
      recommendation: this.makeRecommendation(overallScore, improvements, concerns),
      createdAt: new Date()
    };
  }

  /**
   * Track clause usage
   */
  trackUsage(
    clauseId: string,
    contractId: string,
    contractName: string,
    usedBy: string,
    context: string,
    modifications?: string
  ): void {
    const usage: ClauseUsage = {
      id: this.generateId(),
      clauseId,
      contractId,
      contractName,
      usedAt: new Date(),
      usedBy,
      context,
      modifications,
      isActive: true
    };

    this.usage.set(usage.id, usage);

    // Update clause usage count
    for (const library of this.libraries.values()) {
      const clause = library.clauses.find(c => c.id === clauseId);
      if (clause) {
        clause.usageCount++;
        clause.lastModified = new Date();
        library.lastUpdated = new Date();
        break;
      }
    }
  }

  /**
   * Get clause analytics
   */
  getClauseAnalytics(clauseId: string): ClauseAnalytics | null {
    const usages = Array.from(this.usage.values()).filter(u => u.clauseId === clauseId);
    
    if (usages.length === 0) {
      return null;
    }

    const uniqueContracts = new Set(usages.map(u => u.contractId)).size;
    const lastUsed = usages.reduce((latest, usage) => 
      usage.usedAt > latest ? usage.usedAt : latest, usages[0].usedAt
    );

    return {
      clauseId,
      totalUsage: usages.length,
      uniqueContracts,
      averageRating: 4.2, // Placeholder - would be calculated from ratings
      lastUsed,
      mostCommonModifications: this.getMostCommonModifications(usages),
      usageByCategory: this.getUsageByCategory(usages),
      usageByFirm: this.getUsageByFirm(usages),
      performanceMetrics: {
        acceptanceRate: 0.85, // Placeholder
        modificationRate: 0.15, // Placeholder
        disputeRate: 0.02 // Placeholder
      }
    };
  }

  // Helper methods
  private generateId(): string {
    return `clause_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return stopWords.includes(word);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private findMatchingSections(original: string, template: string): any[] {
    // Simplified implementation - would use more sophisticated text matching
    return [];
  }

  private generateReplacements(original: string, template: string): any[] {
    // Simplified implementation - would use diff algorithms
    return [];
  }

  private determineSuggestionType(original: string, template: string, request: SmartSuggestionRequest): SuggestionType {
    // Logic to determine suggestion type based on differences
    return 'IMPROVEMENT';
  }

  private generateReasoning(original: string, template: string, type: SuggestionType): string {
    return `The suggested clause provides better ${type.toLowerCase()} based on proven legal precedents.`;
  }

  private identifyBenefits(template: string, original: string): string[] {
    return ['Improved legal clarity', 'Better risk management', 'Enhanced enforceability'];
  }

  private identifyRisks(template: string, original: string): string[] {
    return ['May require legal review', 'Could affect existing agreements'];
  }

  private identifyComplianceImprovements(template: string, frameworks: string[]): string[] {
    return frameworks.map(f => `Enhanced ${f} compliance`);
  }

  private improveClarity(clause: string): string {
    // Simplified implementation - would use AI for actual improvement
    return clause.replace(/\b(shall|must|will)\b/g, 'will')
                 .replace(/\b(notwithstanding|pursuant to)\b/g, 'despite')
                 .replace(/\b(hereby|whereas)\b/g, '');
  }

  private improveCompliance(clause: string, frameworks: string[], jurisdiction: string): string {
    // Simplified implementation - would add compliance-specific language
    let improved = clause;
    
    if (frameworks.includes('GDPR')) {
      improved += '\n\nData subjects have the right to access, rectify, erase, and port their personal data.';
    }
    
    if (frameworks.includes('HIPAA')) {
      improved += '\n\nProtected Health Information shall be handled in accordance with HIPAA requirements.';
    }
    
    return improved;
  }

  private reduceRisk(clause: string, riskLevel: string): string {
    // Simplified implementation - would add risk mitigation language
    return clause + '\n\nThis provision is subject to applicable law and may be limited by statute.';
  }

  private findDifferences(original: string, suggested: string): ClauseDifference[] {
    // Simplified implementation - would use proper diff algorithm
    return [];
  }

  private calculateOverallScore(original: string, suggested: string, differences: ClauseDifference[]): number {
    // Simplified scoring - would use more sophisticated analysis
    return 0.8;
  }

  private identifyImprovements(differences: ClauseDifference[]): string[] {
    return ['Improved clarity', 'Better legal protection', 'Enhanced compliance'];
  }

  private identifyConcerns(differences: ClauseDifference[]): string[] {
    return ['Requires legal review', 'May affect existing agreements'];
  }

  private makeRecommendation(score: number, improvements: string[], concerns: string[]): 'ACCEPT' | 'REJECT' | 'MODIFY' {
    if (score > 0.8 && concerns.length === 0) return 'ACCEPT';
    if (score < 0.4) return 'REJECT';
    return 'MODIFY';
  }

  private getMostCommonModifications(usages: ClauseUsage[]): string[] {
    return ['Minor wording changes', 'Jurisdiction updates', 'Compliance enhancements'];
  }

  private getUsageByCategory(usages: ClauseUsage[]): Record<ClauseCategory, number> {
    // Simplified implementation
    return {} as Record<ClauseCategory, number>;
  }

  private getUsageByFirm(usages: ClauseUsage[]): Record<string, number> {
    // Simplified implementation
    return {};
  }

  private initializeDefaultLibraries(): void {
    // Initialize with some default clause libraries
    const defaultLibrary = this.createLibrary(
      'Default Clause Library',
      'Standard legal clauses for common contract types',
      'default',
      true
    );

    // Add some sample clauses
    this.addSampleClauses(defaultLibrary.id);
  }

  private addSampleClauses(libraryId: string): void {
    const sampleClauses = [
      {
        title: 'Data Protection Clause (GDPR)',
        description: 'Comprehensive data protection clause compliant with GDPR',
        category: 'DATA_PROTECTION' as ClauseCategory,
        content: `The Processor shall process Personal Data only on documented instructions from the Controller, including with regard to transfers of Personal Data to a third country or an international organisation, unless required to do so by Union or Member State law to which the Processor is subject.`,
        alternativeVersions: [],
        tags: ['GDPR', 'data protection', 'privacy', 'EU'],
        status: 'APPROVED' as const,
        riskLevel: 'LOW' as const,
        complianceFrameworks: ['GDPR'],
        jurisdiction: 'EU',
        language: 'en',
        author: 'System',
        isPublic: true,
        metadata: {
          wordCount: 45,
          complexity: 'MODERATE' as const,
          regulatoryReferences: ['GDPR Article 28']
        }
      },
      {
        title: 'Limitation of Liability',
        description: 'Standard limitation of liability clause',
        category: 'LIABILITY_LIMITATION' as ClauseCategory,
        content: `IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.`,
        alternativeVersions: [],
        tags: ['liability', 'limitation', 'damages', 'standard'],
        status: 'APPROVED' as const,
        riskLevel: 'MEDIUM' as const,
        complianceFrameworks: [],
        jurisdiction: 'US',
        language: 'en',
        author: 'System',
        isPublic: true,
        metadata: {
          wordCount: 38,
          complexity: 'MODERATE' as const
        }
      }
    ];

    sampleClauses.forEach(clause => {
      this.addClauseTemplate(libraryId, clause);
    });
  }
}
