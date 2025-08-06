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
  const [favoriteNodes, setFavoriteNodes] = useState<any[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<WorkflowNodeData>) => {
    setNodes((nds) => nds.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
    toast.success('Node updated');
  }, [setNodes]);

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

  const validateWorkflowConnections = () => {
    const nonStartEndNodes = nodes.filter(node => {
      const nodeData = node.data as WorkflowNodeData;
      return nodeData.category !== 'start' && nodeData.category !== 'end';
    });

    if (nonStartEndNodes.length === 0) return true;

    // Check if start node is connected
    const startNode = nodes.find(node => (node.data as WorkflowNodeData).category === 'start');
    const endNode = nodes.find(node => (node.data as WorkflowNodeData).category === 'end');
    
    if (!startNode || !endNode) return false;

    const hasStartConnection = edges.some(edge => edge.source === startNode.id);
    const hasEndConnection = edges.some(edge => edge.target === endNode.id);
    
    if (!hasStartConnection || !hasEndConnection) return false;

    // Check if all intermediate nodes are properly connected
    for (const node of nonStartEndNodes) {
      const hasIncomingConnection = edges.some(edge => edge.target === node.id);
      const hasOutgoingConnection = edges.some(edge => edge.source === node.id);
      
      if (!hasIncomingConnection || !hasOutgoingConnection) {
        return false;
      }
    }
    
    return true;
  };

  const handleRunWorkflow = async () => {
    if (!validateWorkflowConnections()) {
      toast.error('Please ensure all nodes are properly connected before running the workflow');
      return;
    }

    setIsRunning(true);
    toast.info('Running workflow...');
    
    // Simulate workflow execution with progress
    const nonStartEndNodes = nodes.filter(node => {
      const nodeData = node.data as WorkflowNodeData;
      return nodeData.category !== 'start' && nodeData.category !== 'end';
    });

    // Set all nodes to running state
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        data: { ...node.data, isRunning: true, progress: 0, isCompleted: false }
      }))
    );

    // Simulate progress for each node
    for (let i = 0; i < nonStartEndNodes.length; i++) {
      const nodeId = nonStartEndNodes[i].id;
      
      // Animate progress for current node
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setNodes(prevNodes => 
          prevNodes.map(node => 
            node.id === nodeId 
              ? { ...node, data: { ...node.data, progress } }
              : node
          )
        );
      }
      
      // Mark as completed
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, isRunning: false, isCompleted: true } }
            : node
        )
      );
    }

    // Reset all nodes
    setTimeout(() => {
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          data: { ...node.data, isRunning: false, progress: 0, isCompleted: false }
        }))
      );
      setIsRunning(false);
      toast.success('Workflow completed successfully!');
    }, 1000);
  };

  const handleSaveWorkflow = () => {
    const workflowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
      name: `Workflow ${savedWorkflows.length + 1}`
    };
    
    const updatedWorkflows = [...savedWorkflows, workflowData];
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem('savedWorkflows', JSON.stringify(updatedWorkflows));
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

  const handleNewWorkflow = () => {
    // Auto-save current workflow if it has changes
    if (nodes.length > 2 || edges.length > 0) {
      handleSaveWorkflow();
    }
    
    // Create new workflow
    setNodes(initialNodes);
    setEdges(initialEdges);
    setFavoriteNodes([]);
    toast.success('New workflow created');
  };

  const handleClearWorkflow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setFavoriteNodes([]);
    toast.success('Workflow cleared');
  };

  const handleLoadWorkflow = (workflow: any) => {
    setNodes(workflow.nodes || initialNodes);
    setEdges(workflow.edges || initialEdges);
    toast.success('Workflow loaded');
  };

  const handleRemoveFromFavorites = useCallback((nodeId: string) => {
    setFavoriteNodes(prev => prev.filter(n => n.id !== nodeId));
    toast.success('Removed from favorites');
  }, []);

  const handleAddFavoriteToCanvas = useCallback((node: any) => {
    const nodeData = node.data as WorkflowNodeData;
    // Only add non-start/end nodes to canvas
    if (nodeData.category === 'start' || nodeData.category === 'end') return;
    
    addNodeToCenter({
      id: node.id,
      label: nodeData.label,
      description: nodeData.description || '',
      category: nodeData.category,
      icon: nodeData.icon || '',
    });
  }, [addNodeToCenter]);

  const handleRenameWorkflow = useCallback((index: number, newName: string) => {
    const updatedWorkflows = [...savedWorkflows];
    updatedWorkflows[index] = { ...updatedWorkflows[index], name: newName };
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem('savedWorkflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow renamed');
  }, [savedWorkflows]);

  const handleDeleteWorkflow = useCallback((index: number) => {
    const updatedWorkflows = savedWorkflows.filter((_, i) => i !== index);
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem('savedWorkflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow deleted');
  }, [savedWorkflows]);

  // Listen for delete node, favorite, and update events
  useEffect(() => {
    const handleDeleteEvent = (event: any) => {
      handleDeleteNode(event.detail.nodeId);
    };

    const handleFavoriteEvent = (event: any) => {
      const { nodeId, isFavorited, nodeData } = event.detail;
      const node = nodes.find(n => n.id === nodeId);
      
      if (isFavorited && node) {
        setFavoriteNodes(prev => [...prev.filter(n => n.id !== nodeId), node]);
      } else {
        setFavoriteNodes(prev => prev.filter(n => n.id !== nodeId));
      }
    };

    const handleUpdateEvent = (event: any) => {
      const { nodeId, updates } = event.detail;
      handleUpdateNode(nodeId, updates);
    };

    window.addEventListener('deleteNode', handleDeleteEvent);
    window.addEventListener('toggleFavorite', handleFavoriteEvent);
    window.addEventListener('updateNode', handleUpdateEvent);
    
    return () => {
      window.removeEventListener('deleteNode', handleDeleteEvent);
      window.removeEventListener('toggleFavorite', handleFavoriteEvent);
      window.removeEventListener('updateNode', handleUpdateEvent);
    };
  }, [handleDeleteNode, handleUpdateNode, nodes]);

  // Load saved workflows on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedWorkflows');
    if (saved) {
      setSavedWorkflows(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <NodeSidebar 
        onAddNode={addNodeToCenter} 
        savedWorkflows={savedWorkflows}
        onLoadWorkflow={handleLoadWorkflow}
        onRenameWorkflow={handleRenameWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
      />
      
      <div className="flex-1 flex flex-col">
        <WorkflowToolbar
          onRun={handleRunWorkflow}
          onSave={handleSaveWorkflow}
          onExport={handleExportWorkflow}
          onClear={handleClearWorkflow}
          onNewWorkflow={handleNewWorkflow}
          isRunning={isRunning}
          favoriteNodes={favoriteNodes}
          savedWorkflows={savedWorkflows}
          onLoadWorkflow={handleLoadWorkflow}
          onRemoveFromFavorites={handleRemoveFromFavorites}
          onAddFavoriteToCanvas={handleAddFavoriteToCanvas}
          onRenameWorkflow={handleRenameWorkflow}
          onDeleteWorkflow={handleDeleteWorkflow}
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