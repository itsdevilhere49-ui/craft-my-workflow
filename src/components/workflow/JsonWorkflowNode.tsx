import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, X, Settings, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeInstance, NodeSchema } from '@/types/workflow';
import { nodeRegistry } from '@/services/nodeRegistry';
import { NodeConfigurationDialog } from './NodeConfigurationDialog';
import { toast } from 'sonner';

export interface JsonWorkflowNodeData extends Record<string, unknown> {
  nodeInstance: NodeInstance;
  schema: NodeSchema;
  isRunning?: boolean;
  progress?: number;
  isCompleted?: boolean;
  isFavorited?: boolean;
}

const JsonWorkflowNode = memo(({ data, selected, id }: NodeProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const nodeData = data as JsonWorkflowNodeData;
  const { nodeInstance, schema } = nodeData;
  const isStartOrEnd = schema.category === 'start' || schema.category === 'end';
  
  const handleUpdateNode = useCallback((updates: Partial<NodeInstance>) => {
    // Emit custom event for parent to handle node updates
    window.dispatchEvent(new CustomEvent('updateJsonNode', { 
      detail: { nodeId: id, updates } 
    }));
    toast.success('Node configuration updated');
  }, [id]);
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    
    // Emit custom event for parent to handle favorites
    window.dispatchEvent(new CustomEvent('toggleSchemaFavorite', { 
      detail: { schemaId: schema.id, isFavorited: newFavoriteState, schema } 
    }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (schema.category === 'start' || schema.category === 'end') {
      toast.error('Cannot delete start or end nodes');
      return;
    }
    // Emit custom event for parent to handle deletion
    window.dispatchEvent(new CustomEvent('deleteJsonNode', { detail: { nodeId: id } }));
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfigOpen(true);
  };

  // Get professional icon based on category
  const getCategoryIcon = () => {
    if (schema.category === 'start') return <Play className="h-4 w-4" />;
    if (schema.category === 'end') return <Square className="h-4 w-4" />;
    return <span className="text-base">{schema.icon}</span>;
  };

  // Get validation status
  const validationResult = nodeRegistry.validateNodeInstance(nodeInstance);
  const hasValidationErrors = !validationResult.isValid;

  return (
    <div className={cn(
      'workflow-node relative',
      `workflow-node-${schema.category}`,
      selected && 'selected',
      hasValidationErrors && 'border-destructive border-2',
      nodeData.isRunning && 'animate-pulse',
      nodeData.isCompleted && 'ring-2 ring-green-500'
    )}>
      {/* Node Resizer for non-start/end nodes */}
      {!isStartOrEnd && (
        <NodeResizer 
          minWidth={160} 
          minHeight={100} 
          isVisible={selected}
          lineClassName="border-primary"
          handleClassName="!bg-primary !border-primary-foreground"
        />
      )}

      {/* Favorite button */}
      {!isStartOrEnd && (
        <Button
          size="sm"
          variant="ghost"
          className={cn('favorite-btn', isFavorited && 'favorited')}
          onClick={handleFavorite}
        >
          <Star className="h-3 w-3" fill={isFavorited ? 'currentColor' : 'none'} />
        </Button>
      )}

      {/* Configuration button */}
      {!isStartOrEnd && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-1 right-7 opacity-0 hover:opacity-100 transition-opacity"
          onClick={handleConfigure}
        >
          <Settings className="h-3 w-3" />
        </Button>
      )}

      {/* Delete button */}
      {!isStartOrEnd && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity text-destructive"
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Node content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {getCategoryIcon()}
          <h3 className="font-medium text-sm">{schema.name}</h3>
        </div>
        
        <p className="text-xs opacity-90 mb-2">{schema.description}</p>
        
        {/* Validation errors */}
        {hasValidationErrors && (
          <div className="mb-2 p-2 bg-destructive/10 border border-destructive rounded text-xs">
            <p className="font-medium text-destructive mb-1">Configuration Issues:</p>
            {validationResult.errors.slice(0, 2).map((error, index) => (
              <p key={index} className="text-destructive">• {error.message}</p>
            ))}
            {validationResult.errors.length > 2 && (
              <p className="text-destructive">• ... and {validationResult.errors.length - 2} more</p>
            )}
          </div>
        )}
        
        {/* Progress bar during execution */}
        {nodeData.isRunning && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="animate-pulse">Processing...</span>
              <span className="font-mono">{nodeData.progress || 0}%</span>
            </div>
            <Progress value={nodeData.progress || 0} className="h-2">
              <div 
                className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-500 rounded-full" 
                style={{ width: `${nodeData.progress || 0}%` }}
              />
            </Progress>
          </div>
        )}
        
        {/* Completion indicator */}
        {nodeData.isCompleted && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-medium">Completed</span>
          </div>
        )}

        {/* Configuration preview */}
        {!isStartOrEnd && Object.keys(nodeInstance.data).length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-xs opacity-75">
              {Object.keys(nodeInstance.data).length} property{Object.keys(nodeInstance.data).length !== 1 ? 'ies' : 'y'} configured
            </p>
          </div>
        )}
      </div>

      {/* Handles for connections */}
      {schema.category !== 'start' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-white !border-2 !border-current !w-3 !h-3 hover:scale-125 transition-transform"
        />
      )}
      {schema.category !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-white !border-2 !border-current !w-3 !h-3 hover:scale-125 transition-transform"
        />
      )}

      {/* Configuration Dialog */}
      <NodeConfigurationDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        nodeInstance={nodeInstance}
        schema={schema}
        onUpdate={handleUpdateNode}
      />
    </div>
  );
});

JsonWorkflowNode.displayName = 'JsonWorkflowNode';

export default JsonWorkflowNode;