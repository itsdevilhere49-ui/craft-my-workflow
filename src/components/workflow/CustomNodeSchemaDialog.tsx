import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash, Sparkles } from 'lucide-react';
import { NodeSchema, PropertySchema } from '@/types/workflow';
import { toast } from 'sonner';

interface CustomNodeSchemaDialogProps {
  onCreateSchema: (schema: NodeSchema) => void;
}

export const CustomNodeSchemaDialog = ({ onCreateSchema }: CustomNodeSchemaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [schemaData, setSchemaData] = useState<Partial<NodeSchema>>({
    name: '',
    description: '',
    category: 'custom',
    icon: '⭐',
    color: 'hsl(262, 83%, 58%)',
    version: '1.0.0',
    properties: {},
    required: []
  });
  const [newProperty, setNewProperty] = useState<Partial<PropertySchema>>({
    type: 'string',
    title: '',
    description: ''
  });
  const [newPropertyName, setNewPropertyName] = useState('');

  const propertyTypes = [
    'string', 'number', 'boolean', 'array', 'object', 'select', 'multiselect'
  ];

  const handleAddProperty = () => {
    if (!newPropertyName.trim() || !newProperty.title?.trim()) {
      toast.error('Property name and title are required');
      return;
    }

    if (schemaData.properties && schemaData.properties[newPropertyName]) {
      toast.error('Property name already exists');
      return;
    }

    setSchemaData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [newPropertyName]: {
          ...newProperty,
          title: newProperty.title!
        } as PropertySchema
      }
    }));

    setNewPropertyName('');
    setNewProperty({
      type: 'string',
      title: '',
      description: ''
    });
  };

  const handleRemoveProperty = (propertyName: string) => {
    setSchemaData(prev => {
      const newProperties = { ...prev.properties };
      delete newProperties[propertyName];
      
      return {
        ...prev,
        properties: newProperties,
        required: prev.required?.filter(name => name !== propertyName) || []
      };
    });
  };

  const handleToggleRequired = (propertyName: string) => {
    setSchemaData(prev => ({
      ...prev,
      required: prev.required?.includes(propertyName)
        ? prev.required.filter(name => name !== propertyName)
        : [...(prev.required || []), propertyName]
    }));
  };

  const handleCreateSchema = () => {
    if (!schemaData.name?.trim()) {
      toast.error('Schema name is required');
      return;
    }

    if (!schemaData.properties || Object.keys(schemaData.properties).length === 0) {
      toast.error('At least one property is required');
      return;
    }

    const schema: NodeSchema = {
      id: `custom-${Date.now()}`,
      name: schemaData.name,
      description: schemaData.description || '',
      category: 'custom',
      icon: schemaData.icon || '⭐',
      color: schemaData.color || 'hsl(262, 83%, 58%)',
      version: schemaData.version || '1.0.0',
      properties: schemaData.properties,
      required: schemaData.required || []
    };

    onCreateSchema(schema);
    setOpen(false);
    setSchemaData({
      name: '',
      description: '',
      category: 'custom',
      icon: '⭐',
      color: 'hsl(262, 83%, 58%)',
      version: '1.0.0',
      properties: {},
      required: []
    });
    toast.success('Custom node schema created!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          <Sparkles className="h-3 w-3 mr-1" />
          Create Node
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create Custom Node Schema
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="name">Node Name</Label>
                  <Input
                    id="name"
                    value={schemaData.name || ''}
                    onChange={(e) => setSchemaData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Node"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={schemaData.description || ''}
                    onChange={(e) => setSchemaData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What does this node do?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={schemaData.icon || ''}
                    onChange={(e) => setSchemaData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="⭐"
                    maxLength={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add Property */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add New Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="propName">Property Name</Label>
                  <Input
                    id="propName"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    placeholder="propertyName"
                  />
                </div>
                <div>
                  <Label htmlFor="propTitle">Display Title</Label>
                  <Input
                    id="propTitle"
                    value={newProperty.title || ''}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Property Title"
                  />
                </div>
                <div>
                  <Label htmlFor="propType">Type</Label>
                  <Select
                    value={newProperty.type}
                    onValueChange={(value) => setNewProperty(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="propDesc">Description</Label>
                  <Textarea
                    id="propDesc"
                    value={newProperty.description || ''}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Property description"
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddProperty} className="w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Property
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm">Schema Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {schemaData.properties && Object.entries(schemaData.properties).length > 0 ? (
                  Object.entries(schemaData.properties).map(([name, property]) => (
                    <div key={name} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{property.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {property.type}
                            </Badge>
                            {schemaData.required?.includes(name) && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {property.description || 'No description'}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => handleToggleRequired(name)}
                            >
                              {schemaData.required?.includes(name) ? 'Optional' : 'Required'}
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleRemoveProperty(name)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No properties added yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSchema}>
            Create Schema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};