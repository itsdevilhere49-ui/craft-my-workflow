import { Button } from '@/components/ui/button';
import { Play, Save, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onExport: () => void;
  onClear: () => void;
  isRunning: boolean;
}

export const WorkflowToolbar = ({ 
  onRun, 
  onSave, 
  onExport, 
  onClear, 
  isRunning 
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
          
          <Button variant="outline" onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
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