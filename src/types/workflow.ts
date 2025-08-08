// Workflow JSON Schema Types
export interface NodeSchema {
  id: string;
  name: string;
  description: string;
  category: 'start' | 'end' | 'data' | 'process' | 'ai' | 'filter' | 'visualize' | 'conditional' | 'custom';
  icon: string;
  color: string;
  version: string;
  properties: {
    [key: string]: PropertySchema;
  };
  required?: string[];
  uiSchema?: UISchema;
  dataSource?: DataSourceConfig;
}

export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select' | 'multiselect';
  title: string;
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: 'email' | 'url' | 'date' | 'datetime' | 'time' | 'color';
  items?: PropertySchema;
  properties?: { [key: string]: PropertySchema };
}

export interface UISchema {
  [key: string]: {
    'ui:widget'?: 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'datetime' | 'color' | 'file';
    'ui:placeholder'?: string;
    'ui:help'?: string;
    'ui:order'?: string[];
  };
}

export interface DataSourceConfig {
  type: 'api' | 'database' | 'csv' | 'static';
  endpoint?: string;
  query?: string;
  headers?: { [key: string]: string };
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  transformResponse?: string; // JS function string to transform response
}

export interface NodeInstance {
  id: string;
  schemaId: string; // References NodeSchema.id
  position: { x: number; y: number };
  data: {
    [key: string]: any; // Configuration values based on schema
  };
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: NodeInstance[];
  edges: EdgeInstance[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author: string;
  };
}

export interface EdgeInstance {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'smoothstep' | 'step' | 'straight';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  markerEnd?: any;
}

export interface NodeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  property: string;
  message: string;
  value?: any;
}