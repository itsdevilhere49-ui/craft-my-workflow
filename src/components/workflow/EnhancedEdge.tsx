import { memo } from 'react';
import { EdgeProps, getStraightPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/react';

const EnhancedEdge = memo(({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition, 
  style = {}, 
  data 
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,8 L12,4 z"
            fill={style.stroke || '#6366f1'}
            className="transition-colors duration-200"
          />
        </marker>
        
        {/* Animated arrow marker */}
        <marker
          id={`arrowhead-animated-${id}`}
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,8 L12,4 z"
            fill={style.stroke || '#6366f1'}
            className="animate-pulse"
          />
        </marker>
      </defs>
      
      <BaseEdge 
        path={edgePath} 
        style={{
          strokeWidth: 2,
          stroke: '#6366f1',
          ...style
        }}
        markerEnd={`url(#arrowhead${data?.animated ? '-animated' : ''}-${id})`}
      />
      
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-background border rounded px-2 py-1 text-xs font-medium shadow-sm"
          >
            {data?.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

EnhancedEdge.displayName = 'EnhancedEdge';

export default EnhancedEdge;