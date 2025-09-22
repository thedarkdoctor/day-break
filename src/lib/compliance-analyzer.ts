import { 
  ComplianceRule, 
  ComplianceViolation, 
  ComplianceScore, 
  ContractComplianceAnalysis,
  ComplianceFramework,
  RiskLevel,
  ClauseCategory
} from '@/types/compliance';
import { ALL_COMPLIANCE_RULES, RISK_LEVEL_WEIGHTS, FRAMEWORK_WEIGHTS } from './compliance-frameworks';

export class ComplianceAnalyzer {
  private rules: ComplianceRule[];

  constructor(customRules: ComplianceRule[] = []) {
    this.rules = [...ALL_COMPLIANCE_RULES, ...customRules];
  }

  /**
   * Analyze contract text against compliance frameworks
   */
  analyzeContract(
    contractText: string,
    documentName: string,
    frameworks: ComplianceFramework[],
    jurisdiction: string = 'US',
    clientId?: string
  ): ContractComplianceAnalysis {
    const violations: ComplianceViolation[] = [];
    const frameworkScores: ComplianceScore[] = [];
    const autoTags: string[] = [];

    // Analyze each framework
    for (const framework of frameworks) {
      const frameworkRules = this.rules.filter(rule => 
        rule.framework === framework && 
        rule.isActive &&
        (!rule.jurisdiction || rule.jurisdiction === jurisdiction) &&
        (!rule.clientId || rule.clientId === clientId)
      );

      const frameworkViolations = this.analyzeFramework(contractText, frameworkRules, framework);
      violations.push(...frameworkViolations);

      const score = this.calculateFrameworkScore(frameworkViolations, framework);
      frameworkScores.push(score);

      // Generate auto-tags based on violations
      const tags = this.generateAutoTags(frameworkViolations, framework);
      autoTags.push(...tags);
    }

    // Calculate overall compliance score
    const overallScore = this.calculateOverallScore(frameworkScores);
    const overallRiskLevel = this.determineRiskLevel(overallScore);

    // Categorize violations by severity
    const criticalIssues = violations.filter(v => v.severity === 'CRITICAL');
    const mediumIssues = violations.filter(v => v.severity === 'HIGH');
    const lowIssues = violations.filter(v => v.severity === 'MEDIUM' || v.severity === 'LOW');

    return {
      contractId: this.generateContractId(documentName),
      documentName,
      frameworks: frameworkScores,
      overallRiskLevel,
      overallComplianceScore: overallScore,
      criticalIssues,
      mediumIssues,
      lowIssues,
      autoTags: [...new Set(autoTags)], // Remove duplicates
      jurisdiction,
      clientId,
      analyzedAt: new Date()
    };
  }

  /**
   * Analyze contract against specific framework rules
   */
  private analyzeFramework(
    contractText: string, 
    rules: ComplianceRule[], 
    framework: ComplianceFramework
  ): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const text = contractText.toLowerCase();

    for (const rule of rules) {
      const matches = this.findRuleMatches(text, rule);
      
      if (matches.length === 0) {
        // Check if this is a required rule (high weight)
        if (rule.weight > 0.7) {
          violations.push(this.createMissingRuleViolation(rule, framework));
        }
      } else {
        // Check if the rule is properly implemented
        const implementationQuality = this.assessImplementationQuality(contractText, rule, matches);
        
        if (implementationQuality < 0.7) {
          violations.push(this.createImplementationViolation(rule, framework, implementationQuality));
        }
      }
    }

    return violations;
  }

  /**
   * Find matches for a rule in the contract text
   */
  private findRuleMatches(text: string, rule: ComplianceRule): RegExpMatchArray[] {
    const matches: RegExpMatchArray[] = [];
    
    for (const pattern of rule.patterns) {
      const patternMatches = text.match(pattern);
      if (patternMatches) {
        matches.push(patternMatches);
      }
    }

    // Also check for keyword matches
    for (const keyword of rule.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matches.push([keyword] as RegExpMatchArray);
      }
    }

    return matches;
  }

  /**
   * Assess the quality of rule implementation
   */
  private assessImplementationQuality(
    contractText: string, 
    rule: ComplianceRule, 
    matches: RegExpMatchArray[]
  ): number {
    let quality = 0.5; // Base quality

    // Check for specific implementation indicators
    const implementationIndicators = [
      'shall', 'must', 'will', 'required', 'obligation', 'responsibility',
      'procedure', 'process', 'policy', 'standard', 'guideline'
    ];

    const text = contractText.toLowerCase();
    const hasImplementationLanguage = implementationIndicators.some(indicator => 
      text.includes(indicator)
    );

    if (hasImplementationLanguage) quality += 0.2;

    // Check for specific details (dates, timeframes, procedures)
    const hasSpecificDetails = /\d+|\b(day|month|year|hour|minute)\b|procedure|process/i.test(contractText);
    if (hasSpecificDetails) quality += 0.2;

    // Check for legal language
    const hasLegalLanguage = /\b(hereby|whereas|therefore|notwithstanding|pursuant)\b/i.test(contractText);
    if (hasLegalLanguage) quality += 0.1;

    return Math.min(quality, 1.0);
  }

  /**
   * Create violation for missing required rule
   */
  private createMissingRuleViolation(rule: ComplianceRule, framework: ComplianceFramework): ComplianceViolation {
    return {
      id: this.generateViolationId(rule.id),
      ruleId: rule.id,
      rule,
      clauseId: 'missing',
      severity: rule.riskLevel,
      description: `Missing required ${rule.name} provision`,
      explanation: `${rule.description}. This is a critical requirement for ${framework} compliance.`,
      suggestedAction: `Add a clause that ${rule.description.toLowerCase()}`,
      detectedAt: new Date(),
      isResolved: false
    };
  }

  /**
   * Create violation for poor implementation
   */
  private createImplementationViolation(
    rule: ComplianceRule, 
    framework: ComplianceFramework, 
    quality: number
  ): ComplianceViolation {
    const severity: RiskLevel = quality < 0.3 ? 'HIGH' : 'MEDIUM';
    
    return {
      id: this.generateViolationId(rule.id),
      ruleId: rule.id,
      rule,
      clauseId: 'implementation',
      severity,
      description: `Insufficient implementation of ${rule.name}`,
      explanation: `The ${rule.name} provision exists but lacks sufficient detail or specificity for ${framework} compliance.`,
      suggestedAction: `Enhance the clause with specific procedures, timeframes, and responsibilities.`,
      detectedAt: new Date(),
      isResolved: false
    };
  }

  /**
   * Calculate framework-specific compliance score
   */
  private calculateFrameworkScore(violations: ComplianceViolation[], framework: ComplianceFramework): ComplianceScore {
    const totalRules = this.rules.filter(rule => rule.framework === framework).length;
    const violationCount = violations.length;
    
    // Base score (100 - percentage of violations)
    let score = Math.max(0, 100 - (violationCount / totalRules) * 100);
    
    // Adjust for violation severity
    const severityPenalty = violations.reduce((penalty, violation) => {
      return penalty + (RISK_LEVEL_WEIGHTS[violation.severity] * 10);
    }, 0);
    
    score = Math.max(0, score - severityPenalty);
    
    // Apply framework weight
    score = score * FRAMEWORK_WEIGHTS[framework];
    
    const riskLevel = this.determineRiskLevel(score);
    const recommendations = this.generateRecommendations(violations, framework);

    return {
      framework,
      overallScore: Math.round(score),
      riskLevel,
      violations,
      recommendations,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate overall compliance score across all frameworks
   */
  private calculateOverallScore(frameworkScores: ComplianceScore[]): number {
    if (frameworkScores.length === 0) return 0;
    
    const totalScore = frameworkScores.reduce((sum, score) => {
      return sum + (score.overallScore * FRAMEWORK_WEIGHTS[score.framework]);
    }, 0);
    
    const totalWeight = frameworkScores.reduce((sum, score) => {
      return sum + FRAMEWORK_WEIGHTS[score.framework];
    }, 0);
    
    return Math.round(totalScore / totalWeight);
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 90) return 'LOW';
    if (score >= 70) return 'MEDIUM';
    if (score >= 50) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Generate auto-tags based on violations and framework
   */
  private generateAutoTags(violations: ComplianceViolation[], framework: ComplianceFramework): string[] {
    const tags: string[] = [];
    
    // Framework tags
    tags.push(framework);
    
    // Severity tags
    const severities = [...new Set(violations.map(v => v.severity))];
    tags.push(...severities.map(s => `${s.toLowerCase()}-risk`));
    
    // Category tags
    const categories = [...new Set(violations.map(v => v.rule.category))];
    tags.push(...categories.map(c => c.toLowerCase().replace('_', '-')));
    
    // Specific issue tags
    if (violations.some(v => v.rule.category === 'DATA_PROTECTION')) {
      tags.push('data-protection-issues');
    }
    if (violations.some(v => v.rule.category === 'FINANCIAL_REPORTING')) {
      tags.push('financial-compliance-issues');
    }
    if (violations.some(v => v.rule.category === 'HEALTHCARE_PRIVACY')) {
      tags.push('healthcare-privacy-issues');
    }
    
    return tags;
  }

  /**
   * Generate recommendations based on violations
   */
  private generateRecommendations(violations: ComplianceViolation[], framework: ComplianceFramework): string[] {
    const recommendations: string[] = [];
    
    if (violations.length === 0) {
      recommendations.push(`Contract appears to be compliant with ${framework} requirements.`);
      return recommendations;
    }
    
    // Group violations by category
    const violationsByCategory = violations.reduce((acc, violation) => {
      const category = violation.rule.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(violation);
      return acc;
    }, {} as Record<ClauseCategory, ComplianceViolation[]>);
    
    // Generate category-specific recommendations
    for (const [category, categoryViolations] of Object.entries(violationsByCategory)) {
      const criticalCount = categoryViolations.filter(v => v.severity === 'CRITICAL').length;
      const highCount = categoryViolations.filter(v => v.severity === 'HIGH').length;
      
      if (criticalCount > 0) {
        recommendations.push(`URGENT: Address ${criticalCount} critical ${category.toLowerCase().replace('_', ' ')} issues immediately.`);
      }
      if (highCount > 0) {
        recommendations.push(`HIGH PRIORITY: Resolve ${highCount} high-risk ${category.toLowerCase().replace('_', ' ')} issues.`);
      }
    }
    
    // General recommendations
    if (violations.some(v => v.severity === 'CRITICAL')) {
      recommendations.push('Consider legal review before proceeding with this contract.');
    }
    
    recommendations.push(`Implement regular compliance monitoring for ${framework} requirements.`);
    recommendations.push('Consider adding compliance training for contract stakeholders.');
    
    return recommendations;
  }

  /**
   * Generate unique IDs
   */
  private generateContractId(documentName: string): string {
    return `contract_${Date.now()}_${documentName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private generateViolationId(ruleId: string): string {
    return `violation_${ruleId}_${Date.now()}`;
  }

  /**
   * Get rules by framework
   */
  getRulesByFramework(framework: ComplianceFramework): ComplianceRule[] {
    return this.rules.filter(rule => rule.framework === framework);
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: ClauseCategory): ComplianceRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  /**
   * Add custom rule
   */
  addCustomRule(rule: ComplianceRule): void {
    this.rules.push(rule);
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<ComplianceRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;
    
    this.rules[index] = { ...this.rules[index], ...updates, updatedAt: new Date() };
    return true;
  }

  /**
   * Delete rule
   */
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;
    
    this.rules.splice(index, 1);
    return true;
  }
}
