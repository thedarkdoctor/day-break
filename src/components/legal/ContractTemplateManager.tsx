import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Download,
  Upload,
  Settings,
  Search,
  Filter,
  Star,
  Users,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar
} from 'lucide-react';
import { 
  ContractTemplate,
  ContractField,
  FieldType,
  ContractType,
  TemplateLibrary
} from '@/types/contract-generation';
import { ContractGenerationEngine } from '@/lib/contract-generation-engine';

interface ContractTemplateManagerProps {
  onTemplateSelect?: (template: ContractTemplate) => void;
  onTemplateEdit?: (template: ContractTemplate) => void;
  onTemplateDelete?: (templateId: string) => void;
}

export function ContractTemplateManager({ 
  onTemplateSelect, 
  onTemplateEdit, 
  onTemplateDelete 
}: ContractTemplateManagerProps) {
  const [engine] = useState(() => new ContractGenerationEngine());
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ContractTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created' | 'updated'>('usage');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedType, sortBy]);

  const loadTemplates = async () => {
    const templateList = engine.getTemplates();
    setTemplates(templateList);
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
  };

  const handleTemplateEdit = (template: ContractTemplate) => {
    onTemplateEdit?.(template);
  };

  const handleTemplateDelete = (templateId: string) => {
    onTemplateDelete?.(templateId);
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleTemplateCopy = (template: ContractTemplate) => {
    const copiedTemplate: ContractTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isActive: false
    };
    
    setTemplates(prev => [...prev, copiedTemplate]);
  };

  const getTypeIcon = (type: ContractType) => {
    switch (type) {
      case 'SERVICE_AGREEMENT':
        return <FileText className="h-4 w-4" />;
      case 'DATA_PROCESSING_AGREEMENT':
        return <Target className="h-4 w-4" />;
      case 'NON_DISCLOSURE_AGREEMENT':
        return <AlertTriangle className="h-4 w-4" />;
      case 'MERGER_AGREEMENT':
        return <Building className="h-4 w-4" />;
      case 'EMPLOYMENT_CONTRACT':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ContractType) => {
    switch (type) {
      case 'SERVICE_AGREEMENT':
        return 'text-blue-600 bg-blue-50';
      case 'DATA_PROCESSING_AGREEMENT':
        return 'text-green-600 bg-green-50';
      case 'NON_DISCLOSURE_AGREEMENT':
        return 'text-red-600 bg-red-50';
      case 'MERGER_AGREEMENT':
        return 'text-purple-600 bg-purple-50';
      case 'EMPLOYMENT_CONTRACT':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'SIMPLE':
        return 'text-green-600 bg-green-50';
      case 'MODERATE':
        return 'text-yellow-600 bg-yellow-50';
      case 'COMPLEX':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const types = Array.from(new Set(templates.map(t => t.type)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contract Template Manager</h1>
          <p className="text-muted-foreground">
            Manage and organize your contract templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-1">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getTypeIcon(template.type)}
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getTypeColor(template.type)}>
                    {template.type.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline" className={getComplexityColor(template.metadata.complexity)}>
                    {template.metadata.complexity}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Template Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v{template.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{template.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fields</span>
                  <span className="font-medium">
                    {template.metadata.requiredFields} required, {template.metadata.optionalFields} optional
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Est. Time</span>
                  <span className="font-medium">{template.metadata.estimatedTime} min</span>
                </div>

                {/* Usage Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{template.usageCount}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.metadata.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.metadata.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.metadata.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateEdit(template);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateCopy(template);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateDelete(template.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first contract template to get started'
            }
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(selectedTemplate.type)}
              {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm">{selectedTemplate.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version</Label>
                      <p className="text-sm">v{selectedTemplate.version}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Author</Label>
                      <p className="text-sm">{selectedTemplate.author}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Complexity</Label>
                      <Badge className={getComplexityColor(selectedTemplate.metadata.complexity)}>
                        {selectedTemplate.metadata.complexity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estimated Time</Label>
                      <p className="text-sm">{selectedTemplate.metadata.estimatedTime} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Usage Count</Label>
                      <p className="text-sm">{selectedTemplate.usageCount} times</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Used</Label>
                      <p className="text-sm">
                        {selectedTemplate.lastUsed 
                          ? selectedTemplate.lastUsed.toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <div className="space-y-4">
                  {selectedTemplate.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                    <Card key={field.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{field.label}</Label>
                              {field.validation.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {field.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            Order: {field.order}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <ScrollArea className="h-96">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-md">
                    {selectedTemplate.content}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Template Settings</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Allow Custom Fields</span>
                        <Badge variant={selectedTemplate.settings.allowCustomFields ? 'default' : 'secondary'}>
                          {selectedTemplate.settings.allowCustomFields ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require Approval</span>
                        <Badge variant={selectedTemplate.settings.requireApproval ? 'default' : 'secondary'}>
                          {selectedTemplate.settings.requireApproval ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto Save</span>
                        <Badge variant={selectedTemplate.settings.autoSave ? 'default' : 'secondary'}>
                          {selectedTemplate.settings.autoSave ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
