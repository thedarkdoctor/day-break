import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Settings, 
  Eye, 
  Download, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { 
  ContractTemplate,
  ContractField,
  ContractBuilderState,
  FieldSuggestion,
  ContractPreview,
  ContractGenerationRequest,
  GeneratedContract,
  FieldType
} from '@/types/contract-generation';
import { ContractGenerationEngine } from '@/lib/contract-generation-engine';

interface ContractBuilderProps {
  onContractGenerated?: (contract: GeneratedContract) => void;
  onSaveDraft?: (state: ContractBuilderState) => void;
  initialTemplateId?: string;
  clientId?: string;
  dealId?: string;
}

export function ContractBuilder({ 
  onContractGenerated, 
  onSaveDraft,
  initialTemplateId,
  clientId,
  dealId
}: ContractBuilderProps) {
  const [engine] = useState(() => new ContractGenerationEngine());
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [builderState, setBuilderState] = useState<ContractBuilderState>({
    template: null,
    fieldValues: {},
    errors: {},
    warnings: {},
    isValid: false,
    isDirty: false,
    autoFillData: {},
    suggestions: [],
    progress: 0
  });
  const [preview, setPreview] = useState<ContractPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'form' | 'preview' | 'settings'>('form');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (initialTemplateId) {
      const template = templates.find(t => t.id === initialTemplateId);
      if (template) {
        handleTemplateSelect(template);
      }
    }
  }, [initialTemplateId, templates]);

  useEffect(() => {
    if (selectedTemplate) {
      autoFillFields();
    }
  }, [selectedTemplate, clientId, dealId]);

  const loadTemplates = async () => {
    const templateList = engine.getTemplates();
    setTemplates(templateList);
  };

  const handleTemplateSelect = async (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setBuilderState(prev => ({
      ...prev,
      template,
      fieldValues: {},
      errors: {},
      warnings: {},
      isValid: false,
      isDirty: false,
      progress: 0
    }));
  };

  const autoFillFields = async () => {
    if (!selectedTemplate) return;

    const autoFilledValues = engine.autoFillFields(
      selectedTemplate.id,
      clientId,
      dealId
    );

    setBuilderState(prev => ({
      ...prev,
      fieldValues: autoFilledValues,
      autoFillData: autoFilledValues,
      isDirty: Object.keys(autoFilledValues).length > 0
    }));

    // Get suggestions for each field
    const allSuggestions: FieldSuggestion[] = [];
    for (const field of selectedTemplate.fields) {
      const suggestions = engine.getFieldSuggestions(
        selectedTemplate.id,
        field.id,
        clientId,
        dealId
      );
      allSuggestions.push(...suggestions);
    }

    setBuilderState(prev => ({
      ...prev,
      suggestions: allSuggestions
    }));
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setBuilderState(prev => {
      const newFieldValues = { ...prev.fieldValues, [fieldId]: value };
      const newErrors = { ...prev.errors };
      const newWarnings = { ...prev.warnings };

      // Clear previous errors/warnings for this field
      delete newErrors[fieldId];
      delete newWarnings[fieldId];

      // Validate field
      if (selectedTemplate) {
        const field = selectedTemplate.fields.find(f => f.id === fieldId);
        if (field) {
          const validation = { errors: [], warnings: [] }; // Simplified validation
          validation.errors.forEach(error => {
            newErrors[fieldId] = error.message;
          });
          validation.warnings.forEach(warning => {
            newWarnings[fieldId] = warning.message;
          });
        }
      }

      const isValid = Object.keys(newErrors).length === 0;
      const isDirty = true;

      return {
        ...prev,
        fieldValues: newFieldValues,
        errors: newErrors,
        warnings: newWarnings,
        isValid,
        isDirty
      };
    });
  };

  const handleSuggestionAccept = (fieldId: string, suggestion: any) => {
    handleFieldChange(fieldId, suggestion);
    setBuilderState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.fieldId !== fieldId)
    }));
  };

  const generatePreview = async () => {
    if (!selectedTemplate || !builderState.isValid) return;

    setIsPreviewLoading(true);
    try {
      const previewData = await engine.getContractPreview(
        selectedTemplate.id,
        builderState.fieldValues
      );
      setPreview(previewData);
      setSelectedTab('preview');
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const generateContract = async () => {
    if (!selectedTemplate || !builderState.isValid) return;

    setIsGenerating(true);
    try {
      const request: ContractGenerationRequest = {
        templateId: selectedTemplate.id,
        fieldValues: builderState.fieldValues,
        clientId,
        dealId,
        preferences: {
          language: 'en',
          jurisdiction: 'US',
          format: 'DOCX',
          includeComments: false,
          includeTrackChanges: false
        },
        metadata: {
          generatedBy: 'user-123', // Would get from auth context
          generatedAt: new Date(),
          purpose: 'Contract generation',
          notes: 'Generated via contract builder'
        }
      };

      const generatedContract = await engine.generateContract(request);
      onContractGenerated?.(generatedContract);
      
      // Update template usage
      engine.updateTemplateUsage(selectedTemplate.id);
      
    } catch (error) {
      console.error('Error generating contract:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = () => {
    onSaveDraft?.(builderState);
    setBuilderState(prev => ({ ...prev, isDirty: false }));
  };

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'TEXT':
      case 'TEXTAREA':
        return <FileText className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'PHONE':
        return <Phone className="h-4 w-4" />;
      case 'DATE':
        return <Calendar className="h-4 w-4" />;
      case 'CURRENCY':
      case 'NUMBER':
        return <DollarSign className="h-4 w-4" />;
      case 'ADDRESS':
        return <MapPin className="h-4 w-4" />;
      case 'COMPANY':
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFieldSuggestions = (fieldId: string): FieldSuggestion[] => {
    return builderState.suggestions.filter(s => s.fieldId === fieldId);
  };

  const renderField = (field: ContractField) => {
    const value = builderState.fieldValues[field.id] || '';
    const hasError = !!builderState.errors[field.id];
    const hasWarning = !!builderState.warnings[field.id];
    const suggestions = getFieldSuggestions(field.id);

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="flex items-center gap-2">
          {getFieldIcon(field.type)}
          {field.label}
          {field.validation.required && <span className="text-red-500">*</span>}
        </Label>
        
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}

        {/* Field Input */}
        <div className="space-y-2">
          {field.type === 'TEXTAREA' ? (
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : ''}
              rows={4}
            />
          ) : field.type === 'SELECT' ? (
            <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              <SelectTrigger className={hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'BOOLEAN' ? (
            <Select value={value ? 'true' : 'false'} onValueChange={(val) => handleFieldChange(field.id, val === 'true')}>
              <SelectTrigger className={hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : ''}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.id}
              type={field.type === 'EMAIL' ? 'email' : field.type === 'NUMBER' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : ''}
            />
          )}

          {/* Error/Warning Messages */}
          {hasError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {builderState.errors[field.id]}
            </p>
          )}
          {hasWarning && (
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {builderState.warnings[field.id]}
            </p>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Suggestions:</p>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <Lightbulb className="h-3 w-3 text-blue-600" />
                  <span className="text-sm flex-1">{suggestion.suggestion}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSuggestionAccept(field.id, suggestion.suggestion)}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Help Text */}
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
        </div>
      </div>
    );
  };

  const groupedFields = selectedTemplate?.fields.reduce((groups, field) => {
    const category = field.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
    return groups;
  }, {} as Record<string, ContractField[]>) || {};

  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Select a Contract Template</h2>
          <p className="text-muted-foreground mb-6">
            Choose a template to start building your contract
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge variant="secondary">v{template.version}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {template.metadata.requiredFields} required fields • 
                    {template.metadata.estimatedTime} min estimated
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Used {template.usageCount} times
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
          <p className="text-muted-foreground">{selectedTemplate.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={!builderState.isDirty}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            variant="outline" 
            onClick={generatePreview}
            disabled={!builderState.isValid || isPreviewLoading}
          >
            {isPreviewLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Preview
          </Button>
          <Button 
            onClick={generateContract}
            disabled={!builderState.isValid || isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generate Contract
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(builderState.progress)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${builderState.progress}%` }}
          />
        </div>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Fields</p>
                <p className="text-lg font-bold">{selectedTemplate.fields.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-lg font-bold">
                  {Object.keys(builderState.fieldValues).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-lg font-bold">{Object.keys(builderState.errors).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Est. Time</p>
                <p className="text-lg font-bold">{selectedTemplate.metadata.estimatedTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Form Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedFields).map(([category, fields]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => renderField(field))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {preview ? (
            <Card>
              <CardHeader>
                <CardTitle>Contract Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded">
                    {preview.content}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
              <p className="text-muted-foreground mb-4">
                Complete the required fields and click "Preview" to see your contract
              </p>
              <Button 
                onClick={generatePreview}
                disabled={!builderState.isValid || isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Generate Preview
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Settings panel coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}