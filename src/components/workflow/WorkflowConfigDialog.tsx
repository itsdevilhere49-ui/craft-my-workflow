import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save } from 'lucide-react';
import { WorkflowNodeData } from './WorkflowNode';
import { toast } from 'sonner';

interface WorkflowConfigDialogProps {
  node: any;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
}

export const WorkflowConfigDialog = ({ node, onUpdateNode }: WorkflowConfigDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    label: node.data.label || '',
    description: node.data.description || '',
    timeout: node.data.timeout || 30,
    retries: node.data.retries || 0,
    customCode: node.data.customCode || '',
    parameters: node.data.parameters || {},
  });

  const handleSave = () => {
    onUpdateNode(node.id, config);
    setIsOpen(false);
    toast.success('Node configuration updated');
  };

  const renderConfigFields = () => {
    switch (node.data.category) {
      case 'data':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="source-url">Data Source URL</Label>
              <Input
                id="source-url"
                value={config.parameters.sourceUrl || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, sourceUrl: e.target.value }
                }))}
                placeholder="https://api.example.com/data"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-token">Auth Token (Optional)</Label>
              <Input
                id="auth-token"
                type="password"
                value={config.parameters.authToken || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, authToken: e.target.value }
                }))}
                placeholder="Bearer token or API key"
              />
            </div>
          </>
        );
      case 'process':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="operation">Operation Type</Label>
              <Select
                value={config.parameters.operation || 'transform'}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, operation: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transform">Transform Data</SelectItem>
                  <SelectItem value="aggregate">Aggregate</SelectItem>
                  <SelectItem value="sort">Sort</SelectItem>
                  <SelectItem value="group">Group By</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-code">Custom Processing Code</Label>
              <Textarea
                id="custom-code"
                value={config.customCode}
                onChange={(e) => setConfig(prev => ({ ...prev, customCode: e.target.value }))}
                placeholder="// Custom JavaScript code for processing"
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </>
        );
      case 'ai':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select
                value={config.parameters.model || 'gpt-3.5-turbo'}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, model: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="custom">Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">AI Prompt Template</Label>
              <Textarea
                id="prompt"
                value={config.parameters.prompt || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, prompt: e.target.value }
                }))}
                placeholder="Analyze the following data and provide insights..."
                rows={3}
              />
            </div>
          </>
        );
      case 'filter':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="filter-condition">Filter Condition</Label>
              <Input
                id="filter-condition"
                value={config.parameters.condition || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, condition: e.target.value }
                }))}
                placeholder="value > 100 && status === 'active'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-columns">Columns to Filter</Label>
              <Input
                id="filter-columns"
                value={config.parameters.columns || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, columns: e.target.value }
                }))}
                placeholder="column1, column2, column3"
              />
            </div>
          </>
        );
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="custom-config">Custom Configuration</Label>
            <Textarea
              id="custom-config"
              value={JSON.stringify(config.parameters, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setConfig(prev => ({ ...prev, parameters: parsed }));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"key": "value"}'
              className="font-mono text-sm"
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Node: {node.data.label}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="node-label">Node Label</Label>
                <Input
                  id="node-label"
                  value={config.label}
                  onChange={(e) => setConfig(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1"
                  max="300"
                  value={config.timeout}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="node-description">Description</Label>
              <Input
                id="node-description"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Category-specific Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Node-specific Settings</h3>
            {renderConfigFields()}
          </div>

          {/* Advanced Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Advanced Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="retries">Retry Count</Label>
              <Input
                id="retries"
                type="number"
                min="0"
                max="5"
                value={config.retries}
                onChange={(e) => setConfig(prev => ({ ...prev, retries: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};