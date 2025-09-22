# AI Contract Review Compliance & Risk Scoring System

This system provides comprehensive compliance analysis and risk scoring for contracts across multiple regulatory frameworks including GDPR, HIPAA, SOX, CCPA, and more.

## Features

### 🛡️ Multi-Framework Compliance Analysis
- **GDPR**: Data protection, subject rights, cross-border transfers, breach notification
- **HIPAA**: Healthcare privacy, PHI protection, Business Associate Agreements
- **SOX**: Financial reporting, internal controls, audit requirements
- **CCPA**: Consumer rights, data disclosure, opt-out mechanisms
- **ISO 27001**: Information security policies, risk management
- **SOC 2**: System availability, confidentiality controls
- **PCI-DSS**: Cardholder data protection, encryption requirements

### 🎯 Intelligent Risk Scoring
- **Customizable Risk Thresholds**: Set risk levels per client or jurisdiction
- **Weighted Scoring**: Different frameworks have different importance weights
- **Severity-Based Analysis**: Critical, High, Medium, and Low risk categorization
- **Implementation Quality Assessment**: Evaluates how well requirements are implemented

### 🏷️ Auto-Tagging System
- **Automatic Classification**: Contracts are automatically tagged based on analysis
- **Risk-Based Tags**: Critical, high-risk, medium-risk tags
- **Framework Tags**: GDPR, HIPAA, SOX, etc.
- **Category Tags**: Data protection, financial reporting, healthcare privacy
- **Issue-Specific Tags**: Data protection issues, financial compliance issues

### 📊 Comprehensive Dashboard
- **Contract Overview**: Visual cards showing compliance status
- **Framework Scores**: Individual compliance scores per framework
- **Violation Tracking**: Detailed view of all compliance violations
- **Filtering & Sorting**: By framework, risk level, date, name
- **Export Capabilities**: Export analysis results and reports

## Architecture

### Core Components

1. **ComplianceAnalyzer** (`src/lib/compliance-analyzer.ts`)
   - Main analysis engine
   - Rule matching and violation detection
   - Risk scoring calculations
   - Auto-tagging generation

2. **Compliance Frameworks** (`src/lib/compliance-frameworks.ts`)
   - Pre-defined compliance rules for each framework
   - Risk level weights and framework priorities
   - Keyword and pattern matching definitions

3. **Type Definitions** (`src/types/compliance.ts`)
   - TypeScript interfaces for all compliance data structures
   - Risk levels, framework types, violation types

### UI Components

1. **ComplianceDashboard** (`src/components/legal/ComplianceDashboard.tsx`)
   - Main dashboard for viewing contract compliance
   - Filtering, sorting, and visualization
   - Tabbed interface for different views

2. **ComplianceFrameworkConfig** (`src/components/legal/ComplianceFrameworkConfig.tsx`)
   - Configuration interface for compliance frameworks
   - Custom rule creation and management
   - Risk threshold settings

3. **ContractReviewModal** (Enhanced)
   - Integrated compliance analysis
   - Framework selection
   - Jurisdiction-specific analysis

## Usage

### Basic Analysis

```typescript
import { ComplianceAnalyzer } from '@/lib/compliance-analyzer';
import { ComplianceFramework } from '@/types/compliance';

const analyzer = new ComplianceAnalyzer();

const analysis = analyzer.analyzeContract(
  contractText,
  documentName,
  ['GDPR', 'HIPAA', 'SOX'], // frameworks
  'US', // jurisdiction
  'client-123' // optional client ID
);

console.log(analysis.overallComplianceScore); // 85
console.log(analysis.overallRiskLevel); // 'MEDIUM'
console.log(analysis.autoTags); // ['gdpr', 'high-risk', 'data-protection-issues']
```

### Custom Rules

```typescript
const customRule = {
  id: 'custom-data-retention',
  framework: 'CUSTOM' as ComplianceFramework,
  category: 'DATA_RETENTION' as ClauseCategory,
  name: 'Custom Data Retention Policy',
  description: 'Contract must specify data retention period',
  riskLevel: 'HIGH' as RiskLevel,
  keywords: ['retention', 'data retention', 'storage period'],
  patterns: [/retention period/i, /data retention/i],
  weight: 0.8,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

analyzer.addCustomRule(customRule);
```

### Framework Configuration

```typescript
const config = {
  id: 'config-1',
  jurisdiction: 'EU',
  frameworks: ['GDPR', 'CCPA'],
  customRules: [],
  riskThresholds: {
    'LOW': 80,
    'MEDIUM': 60,
    'HIGH': 40,
    'CRITICAL': 20
  },
  autoTaggingEnabled: true,
  notificationSettings: {
    email: true,
    slack: false
  }
};
```

## Integration with Contract Review

The compliance system is fully integrated with the existing AI contract review system:

1. **Automatic Analysis**: When a contract is analyzed, compliance analysis runs automatically
2. **Framework Selection**: Users can select which compliance frameworks to check
3. **Jurisdiction Support**: Analysis adapts based on selected jurisdiction
4. **Unified Results**: Compliance results are displayed alongside AI analysis

## Risk Scoring Algorithm

The risk scoring system uses a weighted approach:

1. **Rule Matching**: Each compliance rule is checked against the contract text
2. **Implementation Quality**: Assesses how well requirements are implemented
3. **Severity Weighting**: Critical violations have higher impact on score
4. **Framework Weighting**: Different frameworks have different importance
5. **Overall Calculation**: Weighted average across all frameworks

### Score Calculation

```
Framework Score = (100 - (violations / total_rules) * 100) - severity_penalty
Overall Score = Σ(framework_score * framework_weight) / Σ(framework_weight)
```

## Auto-Tagging System

The system automatically generates tags based on:

- **Framework**: GDPR, HIPAA, SOX, etc.
- **Risk Level**: critical-risk, high-risk, medium-risk, low-risk
- **Categories**: data-protection, financial-reporting, healthcare-privacy
- **Issues**: data-protection-issues, financial-compliance-issues

## Customization

### Adding New Frameworks

1. Define framework rules in `compliance-frameworks.ts`
2. Add framework type to `ComplianceFramework` enum
3. Update framework weights and priorities
4. Add UI support in configuration components

### Custom Rules

- Create rules with specific keywords and patterns
- Set risk levels and weights
- Define categories and descriptions
- Enable/disable rules as needed

### Risk Thresholds

- Configure minimum scores for each risk level
- Set different thresholds per client or jurisdiction
- Adjust based on business requirements

## Best Practices

1. **Regular Updates**: Keep compliance rules updated with regulatory changes
2. **Custom Rules**: Add client-specific requirements as custom rules
3. **Threshold Tuning**: Adjust risk thresholds based on business risk tolerance
4. **Monitoring**: Use the dashboard to monitor compliance trends
5. **Documentation**: Document custom rules and their business justification

## Future Enhancements

- **Machine Learning**: Learn from user corrections and feedback
- **Regulatory Updates**: Automatic updates when regulations change
- **Integration APIs**: Connect with external compliance databases
- **Advanced Analytics**: Trend analysis and predictive compliance scoring
- **Workflow Integration**: Connect with contract management systems

## Support

For questions or issues with the compliance system:

1. Check the type definitions in `src/types/compliance.ts`
2. Review the analyzer implementation in `src/lib/compliance-analyzer.ts`
3. Examine the framework rules in `src/lib/compliance-frameworks.ts`
4. Test with the demo component in `src/components/legal/ComplianceDemo.tsx`
