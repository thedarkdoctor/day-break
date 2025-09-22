import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplianceAnalyzer } from '@/lib/compliance-analyzer';
import { ContractComplianceAnalysis, ComplianceFramework } from '@/types/compliance';
import { ComplianceDashboard } from './ComplianceDashboard';
import { ComplianceFrameworkConfig } from './ComplianceFrameworkConfig';

export function ComplianceDemo() {
  const [contracts, setContracts] = useState<ContractComplianceAnalysis[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [analyzer] = useState(() => new ComplianceAnalyzer());

  // Sample contract data for demonstration
  const sampleContracts = [
    {
      text: `
        DATA PROCESSING AGREEMENT
        
        This Data Processing Agreement ("DPA") is entered into between Company A and Company B.
        
        Article 1: Data Subject Rights
        The Processor shall ensure that data subjects have the right to access, rectify, erase, and port their personal data.
        
        Article 2: Lawful Basis
        Personal data shall be processed based on legitimate interest and contractual necessity.
        
        Article 3: Data Retention
        Personal data shall be retained for a period of 3 years from the date of collection.
        
        Article 4: Cross-Border Transfers
        Any international transfers shall be subject to Standard Contractual Clauses.
        
        Article 5: Breach Notification
        In case of a data breach, the Processor shall notify the Controller within 72 hours.
      `,
      name: "Data Processing Agreement - Company A"
    },
    {
      text: `
        HEALTHCARE SERVICES AGREEMENT
        
        This agreement covers the provision of healthcare services and data processing.
        
        Section 1: Protected Health Information
        All PHI shall be protected in accordance with HIPAA requirements.
        
        Section 2: Business Associate Agreement
        This agreement serves as a Business Associate Agreement under HIPAA.
        
        Section 3: Minimum Necessary Standard
        Access to PHI shall be limited to the minimum necessary for the intended purpose.
      `,
      name: "Healthcare Services Agreement - Medical Corp"
    },
    {
      text: `
        FINANCIAL SERVICES CONTRACT
        
        This contract covers financial reporting and audit requirements.
        
        Clause 1: Internal Controls
        The Company shall maintain adequate internal controls for financial reporting.
        
        Clause 2: Audit Requirements
        The Company shall provide access to auditors and maintain proper documentation.
        
        Clause 3: Compliance Monitoring
        Regular compliance assessments shall be conducted.
      `,
      name: "Financial Services Contract - Bank Corp"
    }
  ];

  const analyzeSampleContracts = () => {
    const analyzedContracts: ContractComplianceAnalysis[] = [];
    
    sampleContracts.forEach((contract, index) => {
      const frameworks: ComplianceFramework[] = index === 0 ? ['GDPR', 'CCPA'] : 
                                               index === 1 ? ['HIPAA'] : 
                                               ['SOX', 'PCI-DSS'];
      
      const analysis = analyzer.analyzeContract(
        contract.text,
        contract.name,
        frameworks,
        'US'
      );
      
      analyzedContracts.push(analysis);
    });
    
    setContracts(analyzedContracts);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance & Risk Scoring Demo</h1>
          <p className="text-muted-foreground">
            AI-powered contract analysis with compliance framework alignment
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={analyzeSampleContracts}>
            Analyze Sample Contracts
          </Button>
          <Button variant="outline" onClick={() => setShowConfig(true)}>
            Configure Frameworks
          </Button>
        </div>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Get Started</h3>
            <p className="text-muted-foreground mb-4">
              Click "Analyze Sample Contracts" to see the compliance analysis in action.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">GDPR Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  Data protection, subject rights, cross-border transfers
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">HIPAA Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  Healthcare privacy, PHI protection, BAA requirements
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">SOX Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  Financial reporting, internal controls, audit requirements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ComplianceDashboard
          contracts={contracts}
          onViewContract={(contractId) => {
            console.log('View contract:', contractId);
          }}
          onConfigureFrameworks={() => setShowConfig(true)}
        />
      )}

      <ComplianceFrameworkConfig
        open={showConfig}
        onOpenChange={setShowConfig}
        onSave={(config) => {
          console.log('Configuration saved:', config);
          setShowConfig(false);
        }}
      />
    </div>
  );
}
