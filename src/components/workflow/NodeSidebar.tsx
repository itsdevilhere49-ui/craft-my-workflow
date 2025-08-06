import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Database, Cpu, Brain, Filter, BarChart, GitBranch, Plus, FolderOpen, Clock, Edit, Trash, Sparkles, Star } from 'lucide-react';
import { CustomNodeDialog } from './CustomNodeDialog';
import { useState } from 'react';

export interface NodeCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  nodes: NodeTemplate[];
}

export interface NodeTemplate {
  id: string;
  label: string;
  description: string;
  category: 'data' | 'process' | 'ai' | 'filter' | 'visualize' | 'conditional';
  icon: string;
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'data',
    label: 'Data Sources',
    description: 'Connect to ERP, Shopify, CSV, or other data sources',
    icon: <Database className="h-4 w-4" />,
    color: 'data',
    nodes: [
      { id: 'csv', label: 'CSV File', description: 'Import data from CSV', category: 'data', icon: '📊' },
      { id: 'database', label: 'Database', description: 'Connect to SQL database', category: 'data', icon: '🗄️' },
      { id: 'api', label: 'API Source', description: 'Fetch from REST API', category: 'data', icon: '🔗' },
    ]
  },
  {
    id: 'process',
    label: 'Process',
    description: 'Transform, combine, and manipulate data',
    icon: <Cpu className="h-4 w-4" />,
    color: 'process',
    nodes: [
      { id: 'transform', label: 'Transform', description: 'Transform data format', category: 'process', icon: '🔄' },
      { id: 'merge', label: 'Merge', description: 'Combine multiple datasets', category: 'process', icon: '⚡' },
      { id: 'calculate', label: 'Calculate', description: 'Perform calculations', category: 'process', icon: '🧮' },
    ]
  },
  {
    id: 'ai',
    label: 'AI/ML',
    description: 'Apply AI algorithms and smart categorization',
    icon: <Brain className="h-4 w-4" />,
    color: 'ai',
    nodes: [
      { id: 'classify', label: 'Classify', description: 'AI-powered classification', category: 'ai', icon: '🤖' },
      { id: 'predict', label: 'Predict', description: 'Machine learning predictions', category: 'ai', icon: '🔮' },
      { id: 'sentiment', label: 'Sentiment', description: 'Sentiment analysis', category: 'ai', icon: '😊' },
    ]
  },
  {
    id: 'filter',
    label: 'Filter',
    description: 'Filter, sort, and refine data sets',
    icon: <Filter className="h-4 w-4" />,
    color: 'filter',
    nodes: [
      { id: 'filter', label: 'Filter Rows', description: 'Filter data by conditions', category: 'filter', icon: '🔍' },
      { id: 'sort', label: 'Sort', description: 'Sort data by columns', category: 'filter', icon: '📋' },
      { id: 'unique', label: 'Remove Duplicates', description: 'Remove duplicate records', category: 'filter', icon: '🧹' },
    ]
  },
  {
    id: 'visualize',
    label: 'Visualize',
    description: 'Create charts, dashboards, and analytics',
    icon: <BarChart className="h-4 w-4" />,
    color: 'visualize',
    nodes: [
      { id: 'chart', label: 'Chart', description: 'Create charts and graphs', category: 'visualize', icon: '📈' },
      { id: 'dashboard', label: 'Dashboard', description: 'Build interactive dashboard', category: 'visualize', icon: '📊' },
      { id: 'report', label: 'Report', description: 'Generate reports', category: 'visualize', icon: '📄' },
    ]
  },
  {
    id: 'conditional',
    label: 'Conditional',
    description: 'Add if-else conditions and branching logic',
    icon: <GitBranch className="h-4 w-4" />,
    color: 'conditional',
    nodes: [
      { id: 'condition', label: 'If/Else', description: 'Conditional branching', category: 'conditional', icon: '🔀' },
      { id: 'switch', label: 'Switch', description: 'Multi-way branching', category: 'conditional', icon: '🔁' },
      { id: 'loop', label: 'Loop', description: 'Repeat operations', category: 'conditional', icon: '🔄' },
    ]
  },
];

interface NodeSidebarProps {
  onAddNode: (template: NodeTemplate) => void;
  savedWorkflows: any[];
  onLoadWorkflow: (workflow: any) => void;
  onRenameWorkflow: (index: number, newName: string) => void;
  onDeleteWorkflow: (index: number) => void;
}

export const NodeSidebar = ({ onAddNode, savedWorkflows, onLoadWorkflow, onRenameWorkflow, onDeleteWorkflow }: NodeSidebarProps) => {
  const [customNodes, setCustomNodes] = useState<NodeTemplate[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<number | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const handleDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateCustomNode = (template: NodeTemplate) => {
    setCustomNodes(prev => [...prev, template]);
  };

  const handleWorkflowRename = (index: number) => {
    if (newWorkflowName.trim()) {
      onRenameWorkflow(index, newWorkflowName);
      setEditingWorkflow(null);
      setNewWorkflowName('');
    }
  };

  return (
    <div className="workflow-sidebar w-80 flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Saved Workflows Section */}
          {savedWorkflows.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Saved Workflows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedWorkflows.map((workflow, index) => (
                  <div
                    key={index}
                    className="p-2 rounded border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      {editingWorkflow === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={newWorkflowName}
                            onChange={(e) => setNewWorkflowName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleWorkflowRename(index);
                              if (e.key === 'Escape') setEditingWorkflow(null);
                            }}
                            className="h-6 text-xs"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleWorkflowRename(index)}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className="text-sm font-medium cursor-pointer flex-1"
                            onClick={() => onLoadWorkflow(workflow)}
                          >
                            {workflow.name || `Workflow ${index + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingWorkflow(index);
                                setNewWorkflowName(workflow.name || `Workflow ${index + 1}`);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => onDeleteWorkflow(index)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                            <Clock className="h-3 w-3 text-muted-foreground ml-1" />
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {workflow.nodes?.length || 0} nodes • {new Date(workflow.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Node Categories */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Workflow Nodes</h2>
              <CustomNodeDialog onCreateCustomNode={handleCreateCustomNode} />
            </div>
            <p className="text-sm text-muted-foreground">
              Drag nodes to the canvas to build your workflow
            </p>
          </div>

          <div className="space-y-6">
            {/* Custom Nodes Section */}
            {customNodes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-gradient-to-r from-purple-500 to-pink-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Custom Nodes</h3>
                    <p className="text-xs text-muted-foreground">Your personalized workflow nodes</p>
                  </div>
                </div>

                <div className="space-y-2 pl-8">
                  {customNodes.map((node) => (
                    <div
                      key={node.id}
                      className="node-category-item group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{node.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{node.label}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-5 w-5 p-0"
                                onClick={() => onAddNode(node)}
                                title="Add to canvas"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost" 
                                className="h-5 w-5 p-0 text-yellow-500 hover:text-yellow-600"
                                onClick={() => window.dispatchEvent(new CustomEvent('addToFavorites', { 
                                  detail: { nodeTemplate: node } 
                                }))}
                                title="Add to favorites"
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nodeCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded workflow-node-${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{category.label}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pl-8">
                  {category.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="node-category-item group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{node.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{node.label}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-5 w-5 p-0"
                                onClick={() => onAddNode(node)}
                                title="Add to canvas"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost" 
                                className="h-5 w-5 p-0 text-yellow-500 hover:text-yellow-600"
                                onClick={() => window.dispatchEvent(new CustomEvent('addToFavorites', { 
                                  detail: { nodeTemplate: node } 
                                }))}
                                title="Add to favorites"
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};