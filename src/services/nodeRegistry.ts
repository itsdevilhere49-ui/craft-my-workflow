import { NodeSchema, NodeInstance, NodeValidationResult, ValidationError } from '@/types/workflow';
import nodeSchemas from '@/data/nodeSchemas.json';

class NodeRegistryService {
  private schemas: Map<string, NodeSchema> = new Map();

  constructor() {
    this.loadSchemas();
  }

  private loadSchemas() {
    // Load built-in schemas
    nodeSchemas.schemas.forEach(schema => {
      this.schemas.set(schema.id, schema as NodeSchema);
    });

    // Load custom schemas from localStorage
    const customSchemas = localStorage.getItem('customNodeSchemas');
    if (customSchemas) {
      try {
        const parsed = JSON.parse(customSchemas);
        parsed.forEach((schema: NodeSchema) => {
          this.schemas.set(schema.id, schema);
        });
      } catch (error) {
        console.error('Failed to load custom schemas:', error);
      }
    }
  }

  getAllSchemas(): NodeSchema[] {
    return Array.from(this.schemas.values());
  }

  getSchemasByCategory(category: string): NodeSchema[] {
    return this.getAllSchemas().filter(schema => schema.category === category);
  }

  getSchema(id: string): NodeSchema | undefined {
    return this.schemas.get(id);
  }

  addCustomSchema(schema: NodeSchema): boolean {
    try {
      // Validate schema structure
      if (!this.validateSchema(schema)) {
        return false;
      }

      this.schemas.set(schema.id, schema);
      this.saveCustomSchemas();
      return true;
    } catch (error) {
      console.error('Failed to add custom schema:', error);
      return false;
    }
  }

  removeCustomSchema(id: string): boolean {
    try {
      const schema = this.schemas.get(id);
      if (!schema || schema.category !== 'custom') {
        return false; // Can't remove built-in schemas
      }

      this.schemas.delete(id);
      this.saveCustomSchemas();
      return true;
    } catch (error) {
      console.error('Failed to remove custom schema:', error);
      return false;
    }
  }

  validateNodeInstance(nodeInstance: NodeInstance): NodeValidationResult {
    const schema = this.schemas.get(nodeInstance.schemaId);
    if (!schema) {
      return {
        isValid: false,
        errors: [{ property: 'schemaId', message: 'Schema not found' }]
      };
    }

    const errors: ValidationError[] = [];

    // Check required properties
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in nodeInstance.data) || nodeInstance.data[requiredProp] === undefined || nodeInstance.data[requiredProp] === '') {
          errors.push({
            property: requiredProp,
            message: `Required property '${requiredProp}' is missing`,
            value: nodeInstance.data[requiredProp]
          });
        }
      }
    }

    // Validate property types and constraints
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const value = nodeInstance.data[propName];
      
      if (value !== undefined) {
        const propErrors = this.validateProperty(propName, value, propSchema);
        errors.push(...propErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateProperty(name: string, value: any, schema: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Type validation
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({ property: name, message: 'Must be a string', value });
        } else {
          if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
            errors.push({ property: name, message: 'Does not match required pattern', value });
          }
          if (schema.enum && !schema.enum.includes(value)) {
            errors.push({ property: name, message: `Must be one of: ${schema.enum.join(', ')}`, value });
          }
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push({ property: name, message: 'Must be a number', value });
        } else {
          if (schema.minimum !== undefined && value < schema.minimum) {
            errors.push({ property: name, message: `Must be >= ${schema.minimum}`, value });
          }
          if (schema.maximum !== undefined && value > schema.maximum) {
            errors.push({ property: name, message: `Must be <= ${schema.maximum}`, value });
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({ property: name, message: 'Must be a boolean', value });
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({ property: name, message: 'Must be an array', value });
        } else if (schema.items) {
          value.forEach((item, index) => {
            const itemErrors = this.validateProperty(`${name}[${index}]`, item, schema.items);
            errors.push(...itemErrors);
          });
        }
        break;
    }

    return errors;
  }

  private validateSchema(schema: NodeSchema): boolean {
    // Basic schema validation
    return !!(
      schema.id &&
      schema.name &&
      schema.category &&
      schema.properties &&
      typeof schema.properties === 'object'
    );
  }

  private saveCustomSchemas() {
    const customSchemas = this.getAllSchemas().filter(schema => schema.category === 'custom');
    localStorage.setItem('customNodeSchemas', JSON.stringify(customSchemas));
  }

  // Create default node instance from schema
  createNodeInstance(schemaId: string, position: { x: number; y: number }): NodeInstance | null {
    const schema = this.schemas.get(schemaId);
    if (!schema) return null;

    const data: { [key: string]: any } = {};
    
    // Set default values from schema
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.default !== undefined) {
        data[propName] = propSchema.default;
      }
    }

    return {
      id: `${schemaId}_${Date.now()}`,
      schemaId,
      position,
      data,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: schema.version
      }
    };
  }
}

export const nodeRegistry = new NodeRegistryService();