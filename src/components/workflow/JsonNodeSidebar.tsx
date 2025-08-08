import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Cpu, 
  Brain, 
  Filter, 
  BarChart, 
  GitBranch, 
  Plus, 
  FolderOpen, 
  Clock, 
  Edit, 
  Trash, 
  Sparkles, 
  Star,
  Play,
  Square
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { nodeRegistry } from '@/services/nodeRegistry';
import { NodeSchema, WorkflowDefinition } from '@/types/workflow';
import { CustomNodeSchemaDialog } from './CustomNodeSchemaDialog';

const categoryIcons = {
  data: <Database className="h-4 w-4" />,
  process: <Cpu className="h-4 w-4" />,
  ai: <Brain className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
  visualize: <BarChart className="h-4 w-4" />,
  conditional: <GitBranch className="h-4 w-4" />,
  start: <Play className="h-4 w-4" />,
  end: <Square className="h-4 w-4" />,
  custom: <Sparkles className="h-4 w-4" />
};

interface JsonNodeSidebarProps {
  onAddNode: (schema: NodeSchema) => void;
  savedWorkflows: WorkflowDefinition[];
  onLoadWorkflow: (workflow: WorkflowDefinition) => void;
  onRenameWorkflow: (id: string, newName: string) => void;
  onDeleteWorkflow: (id: string) => void;
  favoriteSchemas: NodeSchema[];
  onRemoveFromFavorites: (schemaId: string) => void;
}

export const JsonNodeSidebar = ({ 
  onAddNode, 
  savedWorkflows, 
  onLoadWorkflow, 
  onRenameWorkflow, 
  onDeleteWorkflow,
  favoriteSchemas,
  onRemoveFromFavorites
}: JsonNodeSidebarProps) => {
  const [schemas, setSchemas] = useState<NodeSchema[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSchemas(nodeRegistry.getAllSchemas());
  }, []);

  const handleDragStart = (event: React.DragEvent, schema: NodeSchema) => {
    event.dataTransfer.setData('application/json', JSON.stringify(schema));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleWorkflowRename = (id: string) => {
    if (newWorkflowName.trim()) {
      onRenameWorkflow(id, newWorkflowName);
      setEditingWorkflow(null);
      setNewWorkflowName('');
    }
  };

  const handleCreateCustomSchema = (schema: NodeSchema) => {
    if (nodeRegistry.addCustomSchema(schema)) {
      setSchemas(nodeRegistry.getAllSchemas());
    }
  };

  // Group schemas by category
  const schemasByCategory = schemas.reduce((acc, schema) => {
    if (!acc[schema.category]) {
      acc[schema.category] = [];
    }
    acc[schema.category].push(schema);
    return acc;
  }, {} as { [key: string]: NodeSchema[] });

  // Filter schemas based on search
  const filteredSchemas = searchTerm
    ? schemas.filter(schema => 
        schema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schema.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : schemas;

  return (
    <div className="workflow-sidebar w-80 flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Favorites Section */}
          {favoriteSchemas.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Favorite Nodes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {favoriteSchemas.map((schema) => (
                  <div
                    key={schema.id}
                    className="node-category-item group"
                    draggable
                    onDragStart={(e) => handleDragStart(e, schema)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{schema.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{schema.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {schema.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{schema.description}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => onAddNode(schema)}
                          title="Add to canvas"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => onRemoveFromFavorites(schema.id)}
                          title="Remove from favorites"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
                {savedWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-2 rounded border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      {editingWorkflow === workflow.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={newWorkflowName}
                            onChange={(e) => setNewWorkflowName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleWorkflowRename(workflow.id);
                              if (e.key === 'Escape') setEditingWorkflow(null);
                            }}
                            className="h-6 text-xs"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handleWorkflowRename(workflow.id)}
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
                            {workflow.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingWorkflow(workflow.id);
                                setNewWorkflowName(workflow.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => onDeleteWorkflow(workflow.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                            <Clock className="h-3 w-3 text-muted-foreground ml-1" />
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {workflow.nodes.length} nodes • {new Date(workflow.metadata.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Node Schemas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Workflow Nodes</h2>
              <CustomNodeSchemaDialog onCreateSchema={handleCreateCustomSchema} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Drag nodes to the canvas to build your workflow
            </p>
          </div>

          {/* Display schemas by category or filtered */}
          <div className="space-y-6">
            {searchTerm ? (
              // Show filtered results
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Search Results</h3>
                {filteredSchemas.map((schema) => (
                  <div
                    key={schema.id}
                    className="node-category-item group"
                    draggable
                    onDragStart={(e) => handleDragStart(e, schema)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{schema.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{schema.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {schema.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{schema.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onAddNode(schema)}
                        title="Add to canvas"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show by category
              Object.entries(schemasByCategory).map(([category, categorySchemas]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded workflow-node-${category}`}>
                      {categoryIcons[category as keyof typeof categoryIcons]}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm capitalize">{category}</h3>
                      <p className="text-xs text-muted-foreground">
                        {categorySchemas.length} node{categorySchemas.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pl-8">
                    {categorySchemas.map((schema) => (
                      <div
                        key={schema.id}
                        className="node-category-item group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, schema)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{schema.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{schema.name}</span>
                              {schema.category === 'custom' && (
                                <Badge variant="secondary" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{schema.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onAddNode(schema)}
                            title="Add to canvas"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};