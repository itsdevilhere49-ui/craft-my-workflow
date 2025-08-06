import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Sparkles, Save } from 'lucide-react';
import { NodeTemplate } from './NodeSidebar';
import { toast } from 'sonner';

interface CustomNodeDialogProps {
  onCreateCustomNode: (template: NodeTemplate) => void;
}

export const CustomNodeDialog = ({ onCreateCustomNode }: CustomNodeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nodeConfig, setNodeConfig] = useState({
    label: '',
    description: '',
    category: 'process' as NodeTemplate['category'],
    icon: '⚙️',
    customCode: '',
  });

  const categoryIcons = {
    data: '📊',
    process: '⚙️',
    ai: '🤖',
    filter: '🔍',
    visualize: '📈',
    conditional: '🔀',
  };

  const handleCreate = () => {
    if (!nodeConfig.label.trim()) {
      toast.error('Please enter a node label');
      return;
    }

    const customTemplate: NodeTemplate = {
      id: `custom_${Date.now()}`,
      label: nodeConfig.label,
      description: nodeConfig.description || `Custom ${nodeConfig.category} node`,
      category: nodeConfig.category,
      icon: nodeConfig.icon,
    };

    onCreateCustomNode(customTemplate);
    setIsOpen(false);
    setNodeConfig({
      label: '',
      description: '',
      category: 'process',
      icon: '⚙️',
      customCode: '',
    });
    toast.success('Custom node created successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
          <Sparkles className="h-4 w-4" />
          Create Custom Node
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Create Custom Node
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-label">Node Label *</Label>
              <Input
                id="custom-label"
                value={nodeConfig.label}
                onChange={(e) => setNodeConfig(prev => ({ ...prev, label: e.target.value }))}
                placeholder="My Custom Node"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-icon">Icon</Label>
              <Input
                id="custom-icon"
                value={nodeConfig.icon}
                onChange={(e) => setNodeConfig(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="⚙️"
                className="text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-description">Description</Label>
            <Input
              id="custom-description"
              value={nodeConfig.description}
              onChange={(e) => setNodeConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this node does..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-category">Category</Label>
            <Select
              value={nodeConfig.category}
              onValueChange={(value: NodeTemplate['category']) => setNodeConfig(prev => ({ 
                ...prev, 
                category: value,
                icon: categoryIcons[value]
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data Sources</SelectItem>
                <SelectItem value="process">Process</SelectItem>
                <SelectItem value="ai">AI/ML</SelectItem>
                <SelectItem value="filter">Filter</SelectItem>
                <SelectItem value="visualize">Visualize</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-code">Custom Implementation (Optional)</Label>
            <Textarea
              id="custom-code"
              value={nodeConfig.customCode}
              onChange={(e) => setNodeConfig(prev => ({ ...prev, customCode: e.target.value }))}
              placeholder="// Custom JavaScript code for this node
function execute(input) {
  // Your implementation here
  return processedData;
}"
              className="font-mono text-sm"
              rows={6}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Preview</h4>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{nodeConfig.icon}</span>
              <div>
                <div className="font-medium">{nodeConfig.label || 'Untitled Node'}</div>
                <div className="text-muted-foreground text-xs">
                  {nodeConfig.description || 'No description'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Save className="h-4 w-4" />
            Create Node
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};