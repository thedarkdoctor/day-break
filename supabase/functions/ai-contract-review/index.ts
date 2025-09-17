import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced clause analysis interface
interface ClauseAnalysis {
  text: string;
  start_pos: number;
  end_pos: number;
  risk_level: 'red' | 'yellow' | 'green';
  risk_score: number;
  issues: string[];
  suggestions: string[];
  clause_type: string;
  confidence: number;
  timestamp: string;
}

interface ContractAnalysis {
  document_id: string;
  clauses: ClauseAnalysis[];
  overall_risk_score: number;
  overall_risk_level: 'red' | 'yellow' | 'green';
  summary: {
    total_clauses: number;
    red_clauses: number;
    yellow_clauses: number;
    green_clauses: number;
    compliance_violations: number;
    applicable_frameworks: string[];
  };
  recommendations: string[];
  compliance_flags: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { contract_text, document_name } = await req.json();
    
    if (!contract_text || !document_name) {
      throw new Error('Contract text and document name are required');
    }

    console.log(`Analyzing contract: ${document_name}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Extract JWT token and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Risk patterns for analysis
    const riskPatterns = {
      high_risk: [
        /unlimited liability/gi,
        /waives all rights/gi,
        /in perpetuity/gi,
        /irrevocable/gi,
        /without limitation/gi,
        /any and all claims/gi,
        /assigns all rights/gi,
        /sole discretion/gi,
        /absolute right/gi
      ],
      medium_risk: [
        /reasonable efforts/gi,
        /as deemed appropriate/gi,
        /commercially reasonable/gi,
        /best efforts/gi,
        /subject to change/gi,
        /may be modified/gi,
        /from time to time/gi
      ],
      compliance_gdpr: [
        /personal data/gi,
        /data subject/gi,
        /data processing/gi,
        /data controller/gi,
        /data processor/gi,
        /eu.*resident/gi
      ],
      compliance_hipaa: [
        /protected health information/gi,
        /phi/gi,
        /medical records/gi,
        /health information/gi,
        /healthcare data/gi
      ],
      compliance_sox: [
        /financial reporting/gi,
        /internal controls/gi,
        /audit/gi,
        /financial statements/gi,
        /material weakness/gi,
        /public.*company/gi
      ]
    };

    // Clause type patterns
    const clausePatterns = {
      indemnification: /(?:indemnif\w+|hold harmless|defend.*against|protect.*from.*claim)/gi,
      limitation_of_liability: /(?:limitation.*liability|liable.*limited|damages.*limited|exclude.*liability)/gi,
      data_protection: /(?:personal data|data protection|privacy|confidential.*information|gdpr|ccpa)/gi,
      termination: /(?:terminat\w+|end.*agreement|expir\w+|dissolution)/gi,
      governing_law: /(?:governing law|governed by|jurisdiction|applicable law|dispute resolution)/gi,
      payment: /(?:payment|fee|compensation|remuneration|invoice)/gi,
      intellectual_property: /(?:intellectual property|copyright|trademark|patent|proprietary)/gi,
      force_majeure: /(?:force majeure|act of god|unforeseeable|beyond.*control)/gi,
      warranty: /(?:warrant\w+|represent\w+|guarantee|assurance)/gi,
      confidentiality: /(?:confidential|non-disclosure|proprietary.*information|trade.*secret)/gi
    };

    // Segment contract into clauses
    function segmentContract(text: string): Array<{text: string, start_pos: number, end_pos: number}> {
      const segments = [];
      const pattern = /(\n\s*(?:\d+\.|\([a-z]\)|\([0-9]+\)|[A-Z]+\.|Article\s+\d+|Section\s+\d+))/gi;
      const parts = text.split(pattern);
      
      let current_pos = 0;
      for (let i = 0; i < parts.length; i += 2) {
        const clause_text = (parts[i] + (parts[i + 1] || "")).trim();
        if (clause_text.length > 50) {
          const start_pos = current_pos;
          const end_pos = current_pos + clause_text.length;
          segments.push({ text: clause_text, start_pos, end_pos });
          current_pos = end_pos;
        }
      }
      
      return segments;
    }

    // Detect compliance frameworks
    function detectComplianceFrameworks(text: string): string[] {
      const frameworks = [];
      if (riskPatterns.compliance_gdpr.some(pattern => pattern.test(text))) {
        frameworks.push('GDPR');
      }
      if (riskPatterns.compliance_hipaa.some(pattern => pattern.test(text))) {
        frameworks.push('HIPAA');
      }
      if (riskPatterns.compliance_sox.some(pattern => pattern.test(text))) {
        frameworks.push('SOX');
      }
      return frameworks;
    }

    // Identify clause type
    function identifyClauseType(text: string): string {
      for (const [type, pattern] of Object.entries(clausePatterns)) {
        if (pattern.test(text)) {
          return type;
        }
      }
      return 'general';
    }

    // Analyze individual clause
    function analyzeClause(text: string, clause_type: string): {
      risk_level: 'red' | 'yellow' | 'green';
      risk_score: number;
      issues: string[];
    } {
      const issues: string[] = [];
      let risk_score = 0;

      // Check for high-risk patterns
      for (const pattern of riskPatterns.high_risk) {
        if (pattern.test(text)) {
          risk_score += 0.25;
          issues.push(`High-risk language detected: ${pattern.source.replace(/\\/g, '')}`);
        }
      }

      // Check for medium-risk patterns
      for (const pattern of riskPatterns.medium_risk) {
        if (pattern.test(text)) {
          risk_score += 0.15;
          issues.push(`Ambiguous language detected: ${pattern.source.replace(/\\/g, '')}`);
        }
      }

      // Check for compliance issues
      for (const pattern of riskPatterns.compliance_gdpr) {
        if (pattern.test(text)) {
          if (!text.toLowerCase().includes('lawful basis') || !text.toLowerCase().includes('data subject rights')) {
            risk_score += 0.2;
            issues.push('GDPR: Missing required data protection elements');
          }
        }
      }

      for (const pattern of riskPatterns.compliance_hipaa) {
        if (pattern.test(text)) {
          if (!text.toLowerCase().includes('security safeguards') || !text.toLowerCase().includes('minimum necessary')) {
            risk_score += 0.2;
            issues.push('HIPAA: Missing required PHI protection elements');
          }
        }
      }

      // Vagueness analysis
      const vague_words = ['may', 'might', 'could', 'reasonable', 'appropriate', 'adequate', 'best efforts'];
      const vague_count = vague_words.filter(word => text.toLowerCase().includes(word)).length;
      if (vague_count > 2) {
        risk_score += 0.1 + (0.05 * (vague_count - 2));
        issues.push(`High vagueness index: ${vague_count} ambiguous terms detected`);
      }

      // Length-based analysis
      const word_count = text.split(/\s+/).length;
      if (word_count < 10) {
        risk_score += 0.1;
        issues.push('Clause may be too brief for enforceability');
      } else if (word_count > 150) {
        risk_score += 0.05;
        issues.push('Clause complexity may lead to interpretation disputes');
      }

      // Determine risk level
      risk_score = Math.min(risk_score, 1.0);
      let risk_level: 'red' | 'yellow' | 'green';
      if (risk_score >= 0.6) {
        risk_level = 'red';
      } else if (risk_score >= 0.3) {
        risk_level = 'yellow';
      } else {
        risk_level = 'green';
      }

      return { risk_level, risk_score, issues };
    }

    // Generate AI-powered suggestions
    async function generateSuggestions(clause_text: string, issues: string[], clause_type: string): Promise<string[]> {
      try {
        const prompt = `As a legal AI assistant, analyze this contract clause and provide 2-3 specific, actionable suggestions for improvement:

Clause Type: ${clause_type}
Clause Text: "${clause_text}"
Identified Issues: ${issues.join(', ')}

Provide suggestions that:
1. Address the specific legal risks identified
2. Include concrete language improvements
3. Consider industry best practices
4. Maintain commercial balance between parties

Format as a numbered list of specific recommendations.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.3
          }),
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          const suggestions_text = data.choices[0].message.content.trim();
          const suggestions = suggestions_text.split('\n')
            .filter(s => s.trim() && !s.trim().match(/^\d+\.?\s*$/))
            .map(s => s.replace(/^\d+\.\s*/, '').trim())
            .slice(0, 3);
          return suggestions;
        }
      } catch (error) {
        console.error('OpenAI API call failed:', error);
      }
      return [];
    }

    // Generate executive summary with enhanced formatting
    function generateExecutiveSummary(analysis: ContractAnalysis): string {
      const risk_indicator = analysis.overall_risk_level === "red" 
        ? "🔴 HIGH RISK" 
        : analysis.overall_risk_level === "yellow" 
        ? "🟡 MEDIUM RISK" 
        : "🟢 LOW RISK";
        
      let summary = `EXECUTIVE SUMMARY - CONTRACT RISK ASSESSMENT
Document: ${analysis.document_id}
Risk Level: ${risk_indicator} (Score: ${analysis.overall_risk_score.toFixed(1)}/1.0)

KEY FINDINGS:
• Total Clauses Reviewed: ${analysis.summary.total_clauses}
• High-Risk Issues: ${analysis.summary.red_clauses}
• Medium-Risk Issues: ${analysis.summary.yellow_clauses}
• Compliance Violations: ${analysis.compliance_flags.length}

BUSINESS IMPACT:
`;
        
      if (analysis.overall_risk_level === "red") {
        summary += "❌ RECOMMENDATION: DO NOT EXECUTE without legal review\n";
        summary += "• Significant legal and financial exposure identified\n";
        summary += "• Multiple high-risk clauses require immediate attention\n";
      } else if (analysis.overall_risk_level === "yellow") {
        summary += "⚠️ RECOMMENDATION: Revise before execution\n";
        summary += "• Moderate risk level acceptable with modifications\n";
        summary += "• Several clauses need clarification\n";
      } else {
        summary += "✅ RECOMMENDATION: Acceptable for execution\n";
        summary += "• Low risk profile within acceptable parameters\n";
        summary += "• Standard commercial terms identified\n";
      }
      
      if (analysis.compliance_flags.length > 0) {
        summary += "\nREGULATORY CONCERNS:\n";
        for (const flag of analysis.compliance_flags.slice(0, 3)) {
          summary += `• ${flag}\n`;
        }
      }
      
      summary += "\nNEXT STEPS:\n";
      for (const recommendation of analysis.recommendations.slice(0, 3)) {
        summary += `• ${recommendation}\n`;
      }
      
      return summary;
    }

    // Main analysis
    const document_id = `${document_name}_${new Date().toISOString().split('T')[0]}`;
    const compliance_frameworks = detectComplianceFrameworks(contract_text);
    const segments = segmentContract(contract_text);
    
    console.log(`Detected compliance frameworks: ${compliance_frameworks.join(', ')}`);
    console.log(`Identified ${segments.length} contract segments`);

    const analyzed_clauses: ClauseAnalysis[] = [];
    let total_risk_score = 0;
    const compliance_violations: string[] = [];

    // Analyze each clause
    for (const segment of segments) {
      const clause_type = identifyClauseType(segment.text);
      const { risk_level, risk_score, issues } = analyzeClause(segment.text, clause_type);
      
      // Generate AI suggestions
      const suggestions = await generateSuggestions(segment.text, issues, clause_type);
      
      // Track compliance violations
      const compliance_issues = issues.filter(issue => 
        issue.includes('GDPR') || issue.includes('HIPAA') || issue.includes('SOX')
      );
      compliance_violations.push(...compliance_issues);

      const clause_analysis: ClauseAnalysis = {
        text: segment.text,
        start_pos: segment.start_pos,
        end_pos: segment.end_pos,
        risk_level,
        risk_score,
        issues,
        suggestions,
        clause_type,
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };

      analyzed_clauses.push(clause_analysis);
      total_risk_score += risk_score;
    }

    // Calculate overall metrics
    const avg_risk_score = analyzed_clauses.length > 0 ? total_risk_score / analyzed_clauses.length : 0;
    const compliance_risk_bonus = Math.min(0.3, compliance_violations.length * 0.1);
    const adjusted_risk_score = Math.min(1.0, avg_risk_score + compliance_risk_bonus);

    let overall_risk_level: 'red' | 'yellow' | 'green';
    if (adjusted_risk_score >= 0.7) {
      overall_risk_level = 'red';
    } else if (adjusted_risk_score >= 0.4) {
      overall_risk_level = 'yellow';
    } else {
      overall_risk_level = 'green';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const red_clauses = analyzed_clauses.filter(c => c.risk_level === 'red').length;
    const yellow_clauses = analyzed_clauses.filter(c => c.risk_level === 'yellow').length;
    const green_clauses = analyzed_clauses.filter(c => c.risk_level === 'green').length;

    if (red_clauses > 0) {
      recommendations.push(`🚨 URGENT: ${red_clauses} high-risk clauses require immediate legal review`);
    }
    if (compliance_violations.length > 0) {
      recommendations.push(`⚖️ ${compliance_violations.length} compliance violations detected - regulatory review needed`);
    }
    if (yellow_clauses > 5) {
      recommendations.push("📝 Multiple ambiguous clauses identified - consider standardization");
    }
    if (adjusted_risk_score > 0.6) {
      recommendations.push("⚠️ Overall contract risk is HIGH - recommend senior counsel review before execution");
    }

    // Create final analysis
    const analysis: ContractAnalysis = {
      document_id,
      clauses: analyzed_clauses,
      overall_risk_score: adjusted_risk_score,
      overall_risk_level,
      summary: {
        total_clauses: analyzed_clauses.length,
        red_clauses,
        yellow_clauses,
        green_clauses,
        compliance_violations: compliance_violations.length,
        applicable_frameworks: compliance_frameworks
      },
      recommendations,
      compliance_flags: Array.from(new Set(compliance_violations))
    };

    // Generate executive summary
    const executive_summary = generateExecutiveSummary(analysis);

    // Store analysis in database
    const { error: insertError } = await supabase
      .from('contract_reviews')
      .insert({
        user_id: user.id,
        document_name,
        analysis_results: analysis,
        risk_level: overall_risk_level,
        risk_score: adjusted_risk_score,
        compliance_flags: compliance_violations
      });

    if (insertError) {
      console.error('Error storing analysis:', insertError);
      // Continue anyway, don't fail the analysis
    }

    console.log(`Analysis completed for ${document_id}`);

    return new Response(JSON.stringify({
      success: true,
      analysis,
      executive_summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-contract-review function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Analysis failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});