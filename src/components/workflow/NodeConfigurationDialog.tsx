import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Settings, CheckCircle2, XCircle } from 'lucide-react';
import { NodeInstance, NodeSchema, PropertySchema } from '@/types/workflow';
import { nodeRegistry } from '@/services/nodeRegistry';
import { toast } from 'sonner';

interface NodeConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeInstance: NodeInstance;
  schema: NodeSchema;
  onUpdate: (updates: Partial<NodeInstance>) => void;
}

export const NodeConfigurationDialog = ({ 
  open, 
  onOpenChange, 
  nodeInstance, 
  schema, 
  onUpdate 
}: NodeConfigurationDialogProps) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  useEffect(() => {
    if (open) {
      setFormData({ ...nodeInstance.data });
      setErrors({});
    }
  }, [open, nodeInstance.data]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const tempInstance = {
      ...nodeInstance,
      data: formData
    };
    
    const validationResult = nodeRegistry.validateNodeInstance(tempInstance);
    const newErrors: { [key: string]: string } = {};
    
    validationResult.errors.forEach(error => {
      newErrors[error.property] = error.message;
    });
    
    setErrors(newErrors);
    return validationResult.isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onUpdate({
        data: formData,
        metadata: {
          ...nodeInstance.metadata,
          updatedAt: new Date().toISOString()
        }
      });
      onOpenChange(false);
    } else {
      toast.error('Please fix validation errors before saving');
    }
  };

  const renderFormField = (fieldName: string, fieldSchema: PropertySchema) => {
    const value = formData[fieldName];
    const error = errors[fieldName];
    const isRequired = schema.required?.includes(fieldName);
    
    const baseProps = {
      id: fieldName,
      value: value || fieldSchema.default || '',
      onChange: (newValue: any) => handleFieldChange(fieldName, newValue),
    };

    switch (fieldSchema.type) {
      case 'string':
        if (fieldSchema.enum) {
          return (
            <Select 
              value={baseProps.value}
              onValueChange={baseProps.onChange}
            >
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder={`Select ${fieldSchema.title}`} />
              </SelectTrigger>
              <SelectContent>
                {fieldSchema.enum.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        if (schema.uiSchema?.[fieldName]?.['ui:widget'] === 'textarea') {
          return (
            <Textarea
              {...baseProps}
              onChange={(e) => baseProps.onChange(e.target.value)}
              placeholder={schema.uiSchema[fieldName]?.['ui:placeholder'] || `Enter ${fieldSchema.title}`}
              className={error ? 'border-destructive' : ''}
              rows={4}
            />
          );
        }
        
        return (
          <Input
            {...baseProps}
            onChange={(e) => baseProps.onChange(e.target.value)}
            placeholder={schema.uiSchema?.[fieldName]?.['ui:placeholder'] || `Enter ${fieldSchema.title}`}
            className={error ? 'border-destructive' : ''}
            type={fieldSchema.format === 'email' ? 'email' : fieldSchema.format === 'url' ? 'url' : 'text'}
          />
        );

      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            onChange={(e) => baseProps.onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={`Enter ${fieldSchema.title}`}
            className={error ? 'border-destructive' : ''}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldName}
              checked={baseProps.value || false}
              onCheckedChange={baseProps.onChange}
            />
            <Label htmlFor={fieldName} className="text-sm">
              {fieldSchema.title}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select 
            value={baseProps.value}
            onValueChange={baseProps.onChange}
          >
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={`Select ${fieldSchema.title}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.enum?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'array':
        return (
          <Textarea
            {...baseProps}
            value={Array.isArray(baseProps.value) ? baseProps.value.join('\n') : ''}
            onChange={(e) => {
              const lines = e.target.value.split('\n').filter(line => line.trim());
              baseProps.onChange(lines);
            }}
            placeholder={`Enter ${fieldSchema.title} (one per line)`}
            className={error ? 'border-destructive' : ''}
            rows={3}
          />
        );

      default:
        return (
          <Input
            {...baseProps}
            onChange={(e) => baseProps.onChange(e.target.value)}
            placeholder={`Enter ${fieldSchema.title}`}
            className={error ? 'border-destructive' : ''}
          />
        );
    }
  };

  const validationResult = nodeRegistry.validateNodeInstance({ ...nodeInstance, data: formData });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {schema.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Schema Info */}
          <Card className="mb-4 flex-shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{schema.icon}</span>
                <div>
                  <CardTitle className="text-sm">{schema.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{schema.description}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  v{schema.version}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Validation Status */}
          <Card className="mb-4 flex-shrink-0">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Configuration Valid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive font-medium">
                      {validationResult.errors.length} Error{validationResult.errors.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {Object.entries(schema.properties).map(([fieldName, fieldSchema]) => (
                <div key={fieldName} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={fieldName} className="text-sm font-medium">
                      {fieldSchema.title}
                    </Label>
                    {schema.required?.includes(fieldName) && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  
                  {fieldSchema.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {fieldSchema.description}
                    </p>
                  )}
                  
                  {renderFormField(fieldName, fieldSchema)}
                  
                  {errors[fieldName] && (
                    <div className="flex items-center gap-1 text-destructive text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors[fieldName]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="flex-shrink-0" />
        
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!validationResult.isValid}
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};