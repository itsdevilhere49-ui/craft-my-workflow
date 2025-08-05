import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, X, Database, Cpu, Brain, Filter, BarChart, GitBranch, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  category: 'start' | 'end' | 'data' | 'process' | 'ai' | 'filter' | 'visualize' | 'conditional';
  icon?: string;
  canDelete?: boolean;
  canFavorite?: boolean;
  isRunning?: boolean;
  progress?: number;
  isCompleted?: boolean;
}

const WorkflowNode = memo(({ data, selected, id }: NodeProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    
    // Emit custom event for parent to handle favorites
    window.dispatchEvent(new CustomEvent('toggleFavorite', { 
      detail: { nodeId: id, isFavorited: newFavoriteState, nodeData: data } 
    }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Emit custom event for parent to handle deletion
    window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId: id } }));
  };

  const nodeData = data as WorkflowNodeData;
  const isStartOrEnd = nodeData.category === 'start' || nodeData.category === 'end';
  
  // Get professional icon based on category
  const getCategoryIcon = () => {
    switch (nodeData.category) {
      case 'start': return <Play className="h-4 w-4" />;
      case 'end': return <div className="h-4 w-4 rounded-full bg-current" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'process': return <Cpu className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'filter': return <Filter className="h-4 w-4" />;
      case 'visualize': return <BarChart className="h-4 w-4" />;
      case 'conditional': return <GitBranch className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className={cn(
      'workflow-node relative',
      `workflow-node-${nodeData.category}`,
      selected && 'selected'
    )}>
      {/* Favorite button */}
      {nodeData.canFavorite && !isStartOrEnd && (
        <Button
          size="sm"
          variant="ghost"
          className={cn('favorite-btn', isFavorited && 'favorited')}
          onClick={handleFavorite}
        >
          <Star className="h-3 w-3" fill={isFavorited ? 'currentColor' : 'none'} />
        </Button>
      )}

      {/* Delete button */}
      {nodeData.canDelete && !isStartOrEnd && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-1 right-7 opacity-0 hover:opacity-100 transition-opacity text-destructive"
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Node content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {getCategoryIcon()}
          <h3 className="font-medium text-sm">{nodeData.label}</h3>
        </div>
        {nodeData.description && (
          <p className="text-xs opacity-90">{nodeData.description}</p>
        )}
        
        {/* Progress bar during execution */}
        {nodeData.isRunning && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Processing...</span>
              <span>{nodeData.progress || 0}%</span>
            </div>
            <Progress value={nodeData.progress || 0} className="h-1" />
          </div>
        )}
        
        {/* Completion indicator */}
        {nodeData.isCompleted && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            <span>Completed</span>
          </div>
        )}
      </div>

      {/* Handles for connections */}
      {nodeData.category !== 'start' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-white !border-2 !border-current !w-3 !h-3"
        />
      )}
      {nodeData.category !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-white !border-2 !border-current !w-3 !h-3"
        />
      )}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;