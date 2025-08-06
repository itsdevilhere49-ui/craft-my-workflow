import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Play, Save, Download, Trash2, Plus, Star, FolderOpen, X, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNodeData } from './WorkflowNode';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

interface WorkflowToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onExport: () => void;
  onClear: () => void;
  onNewWorkflow: () => void;
  isRunning: boolean;
  favoriteNodes: any[];
  savedWorkflows: any[];
  onLoadWorkflow: (workflow: any) => void;
  onRemoveFromFavorites: (nodeId: string) => void;
  onAddFavoriteToCanvas: (node: any) => void;
  onRenameWorkflow: (index: number, newName: string) => void;
  onDeleteWorkflow: (index: number) => void;
}

export const WorkflowToolbar = ({ 
  onRun, 
  onSave, 
  onExport, 
  onClear, 
  onNewWorkflow,
  isRunning,
  favoriteNodes,
  savedWorkflows,
  onLoadWorkflow,
  onRemoveFromFavorites,
  onAddFavoriteToCanvas,
  onRenameWorkflow,
  onDeleteWorkflow
}: WorkflowToolbarProps) => {
  const [editingWorkflow, setEditingWorkflow] = useState<number | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Workflow Builder</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onRun} 
            disabled={isRunning}
            className={cn(
              "gap-2",
              isRunning && "animate-pulse"
            )}
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Workflow'}
          </Button>
          
          {/* Favorites Section */}
          {favoriteNodes.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">Favorites:</span>
                  <div className="flex items-center gap-1">
                    {favoriteNodes.slice(0, 2).map((node, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {(node.data as WorkflowNodeData)?.icon} {(node.data as WorkflowNodeData)?.label}
                      </Badge>
                    ))}
                    {favoriteNodes.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{favoriteNodes.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    Favorite Nodes
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {favoriteNodes.map((node, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => onAddFavoriteToCanvas(node)}>
                          <span className="text-sm">{(node.data as WorkflowNodeData)?.icon}</span>
                          <span className="text-sm font-medium">{(node.data as WorkflowNodeData)?.label}</span>
                          <Plus className="h-3 w-3 opacity-60" />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => onRemoveFromFavorites(node.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button variant="outline" onClick={onNewWorkflow} className="gap-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
          
          <Button variant="outline" onClick={onClear} className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="px-2 py-1 bg-secondary rounded text-xs">
          Drag nodes from sidebar to canvas
        </span>
      </div>
    </div>
  );
};