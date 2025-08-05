import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Play, Save, Download, Trash2, Plus, Star, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNodeData } from './WorkflowNode';

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
  onLoadWorkflow
}: WorkflowToolbarProps) => {
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
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">Favorites:</span>
              <div className="flex items-center gap-1">
                {favoriteNodes.slice(0, 3).map((node, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {(node.data as WorkflowNodeData)?.icon} {(node.data as WorkflowNodeData)?.label}
                  </Badge>
                ))}
                {favoriteNodes.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{favoriteNodes.length - 3}
                  </Badge>
                )}
              </div>
            </div>
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