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
  ReactFlowInstance,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import JsonWorkflowNode, { JsonWorkflowNodeData } from './JsonWorkflowNode';
import { JsonNodeSidebar } from './JsonNodeSidebar';
import { WorkflowToolbar } from './WorkflowToolbar';
import EnhancedEdge from './EnhancedEdge';
import { NodeInstance, NodeSchema, WorkflowDefinition, EdgeInstance } from '@/types/workflow';
import { nodeRegistry } from '@/services/nodeRegistry';
import { toast } from 'sonner';

const nodeTypes = {
  jsonWorkflowNode: JsonWorkflowNode,
};

const edgeTypes = {
  enhanced: EnhancedEdge,
};

// Default start and end nodes
const createDefaultNodes = (): Node[] => {
  const startSchema: NodeSchema = {
    id: 'start',
    name: 'Start',
    description: 'Beginning of workflow',
    category: 'start',
    icon: '▶️',
    color: 'hsl(142, 76%, 36%)',
    version: '1.0.0',
    properties: {}
  };

  const endSchema: NodeSchema = {
    id: 'end',
    name: 'End',
    description: 'End of workflow',
    category: 'end',
    icon: '🏁',
    color: 'hsl(0, 84%, 60%)',
    version: '1.0.0',
    properties: {}
  };

  return [
    {
      id: 'start',
      type: 'jsonWorkflowNode',
      position: { x: 250, y: 100 },
      data: {
        nodeInstance: {
          id: 'start',
          schemaId: 'start',
          position: { x: 250, y: 100 },
          data: {},
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
          }
        },
        schema: startSchema
      } as JsonWorkflowNodeData,
      deletable: false,
    },
    {
      id: 'end',
      type: 'jsonWorkflowNode',
      position: { x: 600, y: 300 },
      data: {
        nodeInstance: {
          id: 'end',
          schemaId: 'end',
          position: { x: 600, y: 300 },
          data: {},
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
          }
        },
        schema: endSchema
      } as JsonWorkflowNodeData,
      deletable: false,
    },
  ];
};

const initialNodes = createDefaultNodes();
const initialEdges: Edge[] = [];

export const JsonWorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [favoriteSchemas, setFavoriteSchemas] = useState<NodeSchema[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowDefinition[]>([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        type: 'enhanced',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: '#6366f1' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
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
      const schemaData = event.dataTransfer.getData('application/json');

      if (schemaData && reactFlowBounds && reactFlowInstance) {
        try {
          const schema = JSON.parse(schemaData) as NodeSchema;
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

          addNodeFromSchema(schema, position);
        } catch (error) {
          toast.error('Failed to add node');
          console.error('Drop error:', error);
        }
      }
    },
    [reactFlowInstance]
  );

  const addNodeFromSchema = useCallback((schema: NodeSchema, position?: { x: number; y: number }) => {
    if (!reactFlowInstance) return;

    const nodePosition = position || {
      x: Math.random() * 300 + 200,
      y: Math.random() * 300 + 200
    };

    const nodeInstance = nodeRegistry.createNodeInstance(schema.id, nodePosition);
    if (!nodeInstance) {
      toast.error('Failed to create node instance');
      return;
    }

    const newNode: Node = {
      id: nodeInstance.id,
      type: 'jsonWorkflowNode',
      position: nodePosition,
      data: {
        nodeInstance,
        schema
      } as JsonWorkflowNodeData,
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success(`Added ${schema.name} to workflow`);
  }, [reactFlowInstance, setNodes]);

  const handleUpdateJsonNode = useCallback((nodeId: string, updates: Partial<NodeInstance>) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        const currentData = node.data as JsonWorkflowNodeData;
        return {
          ...node,
          data: {
            ...currentData,
            nodeInstance: {
              ...currentData.nodeInstance,
              ...updates
            }
          }
        };
      }
      return node;
    }));
  }, [setNodes]);

  const handleDeleteJsonNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    const nodeData = nodeToDelete.data as JsonWorkflowNodeData;
    if (nodeData.schema.category === 'start' || nodeData.schema.category === 'end') {
      toast.error('Cannot delete start or end nodes');
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    toast.success('Node deleted');
  }, [nodes, setNodes, setEdges]);

  const handleToggleSchemaFavorite = useCallback((schemaId: string, isFavorited: boolean, schema: NodeSchema) => {
    if (isFavorited) {
      setFavoriteSchemas(prev => prev.some(s => s.id === schemaId) ? prev : [...prev, schema]);
      toast.success('Added to favorites');
    } else {
      setFavoriteSchemas(prev => prev.filter(s => s.id !== schemaId));
      toast.success('Removed from favorites');
    }
  }, []);

  const validateWorkflowConnections = () => {
    const nonStartEndNodes = nodes.filter(node => {
      const nodeData = node.data as JsonWorkflowNodeData;
      return nodeData.schema.category !== 'start' && nodeData.schema.category !== 'end';
    });

    if (nonStartEndNodes.length === 0) return true;

    // Check if start node is connected
    const startNode = nodes.find(node => (node.data as JsonWorkflowNodeData).schema.category === 'start');
    const endNode = nodes.find(node => (node.data as JsonWorkflowNodeData).schema.category === 'end');
    
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
      
      // Validate node configuration
      const nodeData = node.data as JsonWorkflowNodeData;
      const validation = nodeRegistry.validateNodeInstance(nodeData.nodeInstance);
      if (!validation.isValid) {
        return false;
      }
    }
    
    return true;
  };

  const handleRunWorkflow = async () => {
    if (!validateWorkflowConnections()) {
      toast.error('Please ensure all nodes are properly connected and configured before running the workflow');
      return;
    }

    setIsRunning(true);
    toast.info('Running workflow...');
    
    // Simulate workflow execution with progress
    const executableNodes = nodes.filter(node => {
      const nodeData = node.data as JsonWorkflowNodeData;
      return nodeData.schema.category !== 'start' && nodeData.schema.category !== 'end';
    });

    // Set all nodes to running state
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        data: { ...node.data, isRunning: true, progress: 0, isCompleted: false }
      }))
    );

    // Simulate progress for each node
    for (let i = 0; i < executableNodes.length; i++) {
      const nodeId = executableNodes[i].id;
      
      // Animate progress for current node
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise(resolve => setTimeout(resolve, 300));
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
    const nodeInstances: NodeInstance[] = nodes.map(node => {
      const nodeData = node.data as JsonWorkflowNodeData;
      return {
        ...nodeData.nodeInstance,
        position: node.position
      };
    });

    const edgeInstances: EdgeInstance[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: (edge.type as 'default' | 'smoothstep' | 'step' | 'straight') || 'default',
      animated: edge.animated,
      style: edge.style ? {
        stroke: edge.style.stroke as string | undefined,
        strokeWidth: typeof edge.style.strokeWidth === 'number' ? edge.style.strokeWidth : undefined,
        strokeDasharray: edge.style.strokeDasharray as string | undefined
      } : undefined,
      markerEnd: edge.markerEnd
    }));

    const workflow: WorkflowDefinition = {
      id: `workflow_${Date.now()}`,
      name: `Workflow ${savedWorkflows.length + 1}`,
      description: 'Workflow created with JSON-driven nodes',
      version: '1.0.0',
      nodes: nodeInstances,
      edges: edgeInstances,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'User'
      }
    };
    
    const updatedWorkflows = [...savedWorkflows, workflow];
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem('jsonSavedWorkflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow saved');
  };

  const handleLoadWorkflow = (workflow: WorkflowDefinition) => {
    try {
      const loadedNodes: Node[] = workflow.nodes.map(nodeInstance => {
        const schema = nodeRegistry.getSchema(nodeInstance.schemaId);
        if (!schema) {
          console.warn(`Schema not found for node: ${nodeInstance.schemaId}`);
          return null;
        }

        return {
          id: nodeInstance.id,
          type: 'jsonWorkflowNode',
          position: nodeInstance.position,
          data: {
            nodeInstance,
            schema
          } as JsonWorkflowNodeData,
          deletable: schema.category !== 'start' && schema.category !== 'end'
        };
      }).filter(Boolean) as Node[];

      const loadedEdges: Edge[] = workflow.edges.map(edgeInstance => ({
        id: edgeInstance.id,
        source: edgeInstance.source,
        target: edgeInstance.target,
        sourceHandle: edgeInstance.sourceHandle,
        targetHandle: edgeInstance.targetHandle,
        type: 'enhanced',
        animated: edgeInstance.animated,
        style: edgeInstance.style,
        markerEnd: { type: MarkerType.ArrowClosed }
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      toast.success('Workflow loaded successfully');
    } catch (error) {
      toast.error('Failed to load workflow');
      console.error('Load error:', error);
    }
  };

  const handleNewWorkflow = () => {
    // Auto-save current workflow if it has changes
    if (nodes.length > 2 || edges.length > 0) {
      handleSaveWorkflow();
    }
    
    // Create new workflow
    setNodes(createDefaultNodes());
    setEdges(initialEdges);
    toast.success('New workflow created');
  };

  const handleClearWorkflow = () => {
    setNodes(createDefaultNodes());
    setEdges(initialEdges);
    toast.success('Workflow cleared');
  };

  const handleRenameWorkflow = useCallback((id: string, newName: string) => {
    const updatedWorkflows = savedWorkflows.map(workflow => 
      workflow.id === id ? { ...workflow, name: newName } : workflow
    );
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem('jsonSavedWorkflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow renamed');
  }, [savedWorkflows]);

  const handleDeleteWorkflow = useCallback((id: string) => {
    const updatedWorkflows = savedWorkflows.filter(workflow => workflow.id !== id);
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem('jsonSavedWorkflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow deleted');
  }, [savedWorkflows]);

  // Listen for events from nodes
  useEffect(() => {
    const handleUpdateJsonNodeEvent = (event: any) => {
      const { nodeId, updates } = event.detail;
      handleUpdateJsonNode(nodeId, updates);
    };

    const handleDeleteJsonNodeEvent = (event: any) => {
      const { nodeId } = event.detail;
      handleDeleteJsonNode(nodeId);
    };

    const handleToggleSchemaFavoriteEvent = (event: any) => {
      const { schemaId, isFavorited, schema } = event.detail;
      handleToggleSchemaFavorite(schemaId, isFavorited, schema);
    };

    window.addEventListener('updateJsonNode', handleUpdateJsonNodeEvent);
    window.addEventListener('deleteJsonNode', handleDeleteJsonNodeEvent);
    window.addEventListener('toggleSchemaFavorite', handleToggleSchemaFavoriteEvent);
    
    return () => {
      window.removeEventListener('updateJsonNode', handleUpdateJsonNodeEvent);
      window.removeEventListener('deleteJsonNode', handleDeleteJsonNodeEvent);
      window.removeEventListener('toggleSchemaFavorite', handleToggleSchemaFavoriteEvent);
    };
  }, [handleUpdateJsonNode, handleDeleteJsonNode, handleToggleSchemaFavorite]);

  // Load saved workflows on mount
  useEffect(() => {
    const saved = localStorage.getItem('jsonSavedWorkflows');
    if (saved) {
      try {
        setSavedWorkflows(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved workflows:', error);
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <JsonNodeSidebar 
        onAddNode={addNodeFromSchema} 
        savedWorkflows={savedWorkflows}
        onLoadWorkflow={handleLoadWorkflow}
        onRenameWorkflow={handleRenameWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
        favoriteSchemas={favoriteSchemas}
        onRemoveFromFavorites={(schemaId) => setFavoriteSchemas(prev => prev.filter(s => s.id !== schemaId))}
      />
      
      <div className="flex-1 flex flex-col">
        <WorkflowToolbar
          onRun={handleRunWorkflow}
          onSave={handleSaveWorkflow}
          onExport={() => {}} // TODO: Implement export for JSON workflows
          onClear={handleClearWorkflow}
          onNewWorkflow={handleNewWorkflow}
          isRunning={isRunning}
          favoriteNodes={[]} // Using favoriteSchemas instead
          savedWorkflows={[]} // Using savedWorkflows state instead
          onLoadWorkflow={() => {}}
          onRemoveFromFavorites={() => {}}
          onAddFavoriteToCanvas={() => {}}
          onRenameWorkflow={() => {}}
          onDeleteWorkflow={() => {}}
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
            edgeTypes={edgeTypes}
            fitView
            className="workflow-canvas"
            defaultEdgeOptions={{
              type: 'enhanced',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { strokeWidth: 2, stroke: '#6366f1' }
            }}
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor={(node) => {
                const nodeData = node.data as JsonWorkflowNodeData;
                return nodeData.schema.color || '#e5e7eb';
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

export const JsonWorkflowApp = () => (
  <JsonWorkflowCanvas />
);