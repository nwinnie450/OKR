import { useState } from 'react';
import { Search, Sparkles, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  OKR_TEMPLATES,
  TEMPLATE_CATEGORIES,
  searchTemplates,
  getTemplatesByCategory,
  type OKRTemplate,
} from '@/data/okr-templates';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selectedType?: "company" | "department" | "team" | "individual";
  onSelectTemplate: (template: OKRTemplate | null) => void;
  onSkip: () => void;
}

export function TemplateSelector({ selectedType, onSelectTemplate, onSkip }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<OKRTemplate | null>(null);

  // Filter templates by type first, then by search/category
  const typeFilteredTemplates = selectedType
    ? OKR_TEMPLATES.filter(t => t.type === selectedType)
    : OKR_TEMPLATES;

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery).filter(t => !selectedType || t.type === selectedType)
    : selectedCategory
    ? getTemplatesByCategory(selectedCategory as any).filter(t => !selectedType || t.type === selectedType)
    : typeFilteredTemplates;

  const handleUseTemplate = (template: OKRTemplate) => {
    onSelectTemplate(template);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Create Your OKR
        </h1>
        <p className="text-lg text-slate-600">
          Start with a proven template or build from scratch
        </p>
        {selectedType && (
          <div className="mt-3">
            <Badge variant="outline" className="text-sm">
              Showing <span className="font-semibold capitalize mx-1">{selectedType}</span> templates
            </Badge>
          </div>
        )}
      </div>

      {/* Search and Skip */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={onSkip}>
          Start from Scratch
        </Button>
      </div>

      {/* Category Filters */}
      {!searchQuery && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.value ? null : category.value
                )
              }
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:scale-105',
                selectedCategory === category.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium text-slate-900">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredTemplates.map((template) => {
          const category = TEMPLATE_CATEGORIES.find(
            (c) => c.value === template.category
          );
          return (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={cn('text-xs', category?.color)}>
                    {category?.icon} {category?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                    className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Preview
                  </Button>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {template.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full"
                  size="sm"
                >
                  Use Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No templates found matching your search</p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl mb-2">
                  {previewTemplate?.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {previewTemplate?.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6">
              {/* Best For */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Best For:</h4>
                <p className="text-sm text-slate-600">{previewTemplate.bestFor}</p>
              </div>

              {/* Objective */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Objective:</h4>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-slate-900">
                    {previewTemplate.objective}
                  </p>
                </div>
              </div>

              {/* Key Results */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Key Results ({previewTemplate.keyResults.length}):
                </h4>
                <div className="space-y-2">
                  {previewTemplate.keyResults.map((kr, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-700 flex-1">{kr}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {previewTemplate.tips && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-sm text-amber-900 mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Pro Tip
                  </h4>
                  <p className="text-sm text-amber-800">{previewTemplate.tips}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1"
                >
                  Use This Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateSelector;
