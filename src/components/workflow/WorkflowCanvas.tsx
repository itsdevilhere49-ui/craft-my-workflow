import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import WorkflowNode, { WorkflowNodeData } from './WorkflowNode';
import { NodeSidebar, NodeTemplate } from './NodeSidebar';
import { WorkflowToolbar } from './WorkflowToolbar';
import { toast } from 'sonner';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'workflowNode',
    position: { x: 250, y: 100 },
    data: {
      label: 'Start',
      description: 'Beginning of workflow',
      category: 'start',
      icon: '▶️',
      canDelete: false,
      canFavorite: false,
    },
    deletable: false,
  },
  {
    id: 'end',
    type: 'workflowNode',
    position: { x: 600, y: 300 },
    data: {
      label: 'End',
      description: 'End of workflow',
      category: 'end',
      icon: '🏁',
      canDelete: false,
      canFavorite: false,
    },
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const template = JSON.parse(event.dataTransfer.getData('application/reactflow')) as NodeTemplate;

      if (template && reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${template.category}_${Date.now()}`,
          type: 'workflowNode',
          position,
          data: {
            label: template.label,
            description: template.description,
            category: template.category,
            icon: template.icon,
            canDelete: true,
            canFavorite: true,
          },
        };

        setNodes((nds) => nds.concat(newNode));
        toast.success(`Added ${template.label} to workflow`);
      }
    },
    [reactFlowInstance, setNodes]
  );

  const addNodeToCenter = useCallback((template: NodeTemplate) => {
    if (!reactFlowInstance) return;

    const { x, y, zoom } = reactFlowInstance.getViewport();
    const position = {
      x: (-x + window.innerWidth / 2) / zoom - 150,
      y: (-y + window.innerHeight / 2) / zoom - 50,
    };

    const newNode: Node = {
      id: `${template.category}_${Date.now()}`,
      type: 'workflowNode',
      position,
      data: {
        label: template.label,
        description: template.description,
        category: template.category,
        icon: template.icon,
        canDelete: true,
        canFavorite: true,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success(`Added ${template.label} to workflow`);
  }, [reactFlowInstance, setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const nodeData = nodeToDelete?.data as WorkflowNodeData;
    if (nodeData?.category === 'start' || nodeData?.category === 'end') {
      toast.error('Cannot delete start or end nodes');
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    toast.success('Node deleted');
  }, [nodes, setNodes, setEdges]);

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    toast.info('Running workflow...');
    
    // Simulate workflow execution
    setTimeout(() => {
      setIsRunning(false);
      toast.success('Workflow completed successfully!');
    }, 2000);
  };

  const handleSaveWorkflow = () => {
    const workflowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, you would save to a backend
    localStorage.setItem('workflow', JSON.stringify(workflowData));
    toast.success('Workflow saved');
  };

  const handleExportWorkflow = () => {
    const workflowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  };

  const handleClearWorkflow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    toast.success('Workflow cleared');
  };

  // Listen for delete node events
  useEffect(() => {
    const handleDeleteEvent = (event: any) => {
      handleDeleteNode(event.detail.nodeId);
    };

    window.addEventListener('deleteNode', handleDeleteEvent);
    return () => window.removeEventListener('deleteNode', handleDeleteEvent);
  }, [handleDeleteNode]);

  return (
    <div className="flex h-screen bg-background">
      <NodeSidebar onAddNode={addNodeToCenter} />
      
      <div className="flex-1 flex flex-col">
        <WorkflowToolbar
          onRun={handleRunWorkflow}
          onSave={handleSaveWorkflow}
          onExport={handleExportWorkflow}
          onClear={handleClearWorkflow}
          isRunning={isRunning}
        />
        
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="workflow-canvas"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor={(node) => {
                const nodeData = node.data as WorkflowNodeData;
                const category = nodeData?.category;
                switch (category) {
                  case 'start': return 'hsl(142, 76%, 36%)';
                  case 'end': return 'hsl(0, 84%, 60%)';
                  case 'data': return 'hsl(198, 93%, 60%)';
                  case 'process': return 'hsl(142, 76%, 36%)';
                  case 'ai': return 'hsl(262, 83%, 58%)';
                  case 'filter': return 'hsl(25, 95%, 53%)';
                  case 'visualize': return 'hsl(271, 81%, 56%)';
                  case 'conditional': return 'hsl(217, 91%, 60%)';
                  default: return '#e5e7eb';
                }
              }}
              pannable 
              zoomable 
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export const WorkflowApp = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
};