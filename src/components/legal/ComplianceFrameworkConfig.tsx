import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Globe,
  Users
} from 'lucide-react';
import { 
  ComplianceRule, 
  ComplianceFramework, 
  RiskLevel, 
  ClauseCategory,
  ComplianceConfiguration 
} from '@/types/compliance';
import { ComplianceAnalyzer } from '@/lib/compliance-analyzer';

interface ComplianceFrameworkConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ComplianceConfiguration) => void;
  initialConfig?: ComplianceConfiguration;
}

export function ComplianceFrameworkConfig({ 
  open, 
  onOpenChange, 
  onSave, 
  initialConfig 
}: ComplianceFrameworkConfigProps) {
  const [analyzer] = useState(() => new ComplianceAnalyzer());
  const [config, setConfig] = useState<ComplianceConfiguration>({
    id: '',
    jurisdiction: 'US',
    frameworks: ['GDPR', 'HIPAA', 'SOX'],
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
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSave = () => {
    onSave(config);
    onOpenChange(false);
  };

  const addCustomRule = () => {
    const newRule: ComplianceRule = {
      id: `custom_${Date.now()}`,
      framework: 'CUSTOM',
      category: 'DATA_PROTECTION',
      name: '',
      description: '',
      riskLevel: 'MEDIUM',
      keywords: [],
      patterns: [],
      weight: 0.5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingRule(newRule);
    setIsCreatingRule(true);
  };

  const saveRule = (rule: ComplianceRule) => {
    if (isCreatingRule) {
      setConfig(prev => ({
        ...prev,
        customRules: [...prev.customRules, rule]
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        customRules: prev.customRules.map(r => r.id === rule.id ? rule : r)
      }));
    }
    setEditingRule(null);
    setIsCreatingRule(false);
  };

  const deleteRule = (ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      customRules: prev.customRules.filter(r => r.id !== ruleId)
    }));
  };

  const updateRiskThreshold = (riskLevel: RiskLevel, value: number) => {
    setConfig(prev => ({
      ...prev,
      riskThresholds: {
        ...prev.riskThresholds,
        [riskLevel]: value
      }
    }));
  };

  const toggleFramework = (framework: ComplianceFramework) => {
    setConfig(prev => ({
      ...prev,
      frameworks: prev.frameworks.includes(framework)
        ? prev.frameworks.filter(f => f !== framework)
        : [...prev.frameworks, framework]
    }));
  };

  const getRiskColor = (riskLevel: RiskLevel) => {
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

  const getRiskIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'LOW':
        return <CheckCircle className="h-4 w-4" />;
      case 'MEDIUM':
        return <Shield className="h-4 w-4" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const availableFrameworks: ComplianceFramework[] = [
    'GDPR', 'HIPAA', 'SOX', 'CCPA', 'PIPEDA', 'LGPD', 'ISO27001', 'SOC2', 'PCI-DSS'
  ];

  const clauseCategories: ClauseCategory[] = [
    'DATA_PROTECTION', 'FINANCIAL_REPORTING', 'HEALTHCARE_PRIVACY', 'CONSUMER_RIGHTS',
    'SECURITY_REQUIREMENTS', 'AUDIT_COMPLIANCE', 'TERMINATION_RIGHTS', 'LIABILITY_LIMITATION',
    'INTELLECTUAL_PROPERTY', 'CONFIDENTIALITY', 'DATA_RETENTION', 'CROSS_BORDER_TRANSFER',
    'CONSENT_MANAGEMENT', 'BREACH_NOTIFICATION', 'THIRD_PARTY_SHARING'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Compliance Framework Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="frameworks" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="rules">Custom Rules</TabsTrigger>
            <TabsTrigger value="thresholds">Risk Thresholds</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px]">
            <TabsContent value="frameworks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Jurisdiction & Frameworks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction">Jurisdiction</Label>
                      <Select
                        value={config.jurisdiction}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, jurisdiction: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="EU">European Union</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="GLOBAL">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Active Compliance Frameworks</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableFrameworks.map((framework) => (
                        <div
                          key={framework}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            config.frameworks.includes(framework)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleFramework(framework)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.frameworks.includes(framework)}
                              onChange={() => toggleFramework(framework)}
                              className="rounded"
                            />
                            <span className="font-medium">{framework}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Custom Compliance Rules
                    </CardTitle>
                    <Button onClick={addCustomRule} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {config.customRules.map((rule) => (
                      <div key={rule.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.name}</span>
                              <Badge className={getRiskColor(rule.riskLevel)}>
                                {getRiskIcon(rule.riskLevel)}
                                <span className="ml-1">{rule.riskLevel}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{rule.framework}</Badge>
                              <Badge variant="outline">{rule.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                Weight: {rule.weight}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingRule(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {config.customRules.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No custom rules defined. Click "Add Rule" to create one.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set the minimum compliance scores for each risk level. Contracts scoring below these thresholds will be categorized accordingly.
                  </p>
                  <div className="space-y-4">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as RiskLevel[]).map((riskLevel) => (
                      <div key={riskLevel} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getRiskIcon(riskLevel)}
                          <span className="font-medium">{riskLevel} Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={config.riskThresholds[riskLevel]}
                            onChange={(e) => updateRiskThreshold(riskLevel, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-tagging">Auto-tagging</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically tag contracts based on compliance analysis
                        </p>
                      </div>
                      <Switch
                        id="auto-tagging"
                        checked={config.autoTaggingEnabled}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, autoTaggingEnabled: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Notification Channels</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Email Notifications</span>
                          <Switch
                            checked={config.notificationSettings.email}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({
                                ...prev,
                                notificationSettings: {
                                  ...prev.notificationSettings,
                                  email: checked
                                }
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Slack Notifications</span>
                          <Switch
                            checked={config.notificationSettings.slack}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({
                                ...prev,
                                notificationSettings: {
                                  ...prev.notificationSettings,
                                  slack: checked
                                }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>

      {/* Rule Editor Dialog */}
      {editingRule && (
        <RuleEditorDialog
          rule={editingRule}
          onSave={saveRule}
          onCancel={() => {
            setEditingRule(null);
            setIsCreatingRule(false);
          }}
          clauseCategories={clauseCategories}
        />
      )}
    </Dialog>
  );
}

// Rule Editor Dialog Component
interface RuleEditorDialogProps {
  rule: ComplianceRule;
  onSave: (rule: ComplianceRule) => void;
  onCancel: () => void;
  clauseCategories: ClauseCategory[];
}

function RuleEditorDialog({ rule, onSave, onCancel, clauseCategories }: RuleEditorDialogProps) {
  const [editedRule, setEditedRule] = useState<ComplianceRule>(rule);

  const handleSave = () => {
    onSave(editedRule);
  };

  const addKeyword = () => {
    setEditedRule(prev => ({
      ...prev,
      keywords: [...prev.keywords, '']
    }));
  };

  const updateKeyword = (index: number, value: string) => {
    setEditedRule(prev => ({
      ...prev,
      keywords: prev.keywords.map((keyword, i) => i === index ? value : keyword)
    }));
  };

  const removeKeyword = (index: number) => {
    setEditedRule(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Compliance Rule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={editedRule.name}
                onChange={(e) => setEditedRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-category">Category</Label>
              <Select
                value={editedRule.category}
                onValueChange={(value) => setEditedRule(prev => ({ ...prev, category: value as ClauseCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clauseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-description">Description</Label>
            <Textarea
              id="rule-description"
              value={editedRule.description}
              onChange={(e) => setEditedRule(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule-risk">Risk Level</Label>
              <Select
                value={editedRule.riskLevel}
                onValueChange={(value) => setEditedRule(prev => ({ ...prev, riskLevel: value as RiskLevel }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-weight">Weight (0-1)</Label>
              <Input
                id="rule-weight"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={editedRule.weight}
                onChange={(e) => setEditedRule(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="space-y-2">
              {editedRule.keywords.map((keyword, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    placeholder="Enter keyword"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyword(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addKeyword} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
