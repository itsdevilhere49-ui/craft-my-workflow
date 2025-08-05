import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  category: 'start' | 'end' | 'data' | 'process' | 'ai' | 'filter' | 'visualize' | 'conditional';
  icon?: string;
  canDelete?: boolean;
  canFavorite?: boolean;
}

const WorkflowNode = memo(({ data, selected, id }: NodeProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Emit custom event for parent to handle deletion
    window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId: id } }));
  };

  const nodeData = data as WorkflowNodeData;
  const isStartOrEnd = nodeData.category === 'start' || nodeData.category === 'end';

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
          {nodeData.icon && <span className="text-lg">{nodeData.icon}</span>}
          <h3 className="font-medium text-sm">{nodeData.label}</h3>
        </div>
        {nodeData.description && (
          <p className="text-xs opacity-90">{nodeData.description}</p>
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