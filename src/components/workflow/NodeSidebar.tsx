import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Cpu, Brain, Filter, BarChart, GitBranch, Plus } from 'lucide-react';

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
}

export const NodeSidebar = ({ onAddNode }: NodeSidebarProps) => {
  const handleDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="workflow-sidebar w-80 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Workflow Nodes</h2>
        <p className="text-sm text-muted-foreground">
          Drag nodes to the canvas to build your workflow
        </p>
      </div>

      <div className="space-y-6">
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
                  className="node-category-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, node)}
                  onClick={() => onAddNode(node)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{node.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{node.label}</span>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
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
  );
};