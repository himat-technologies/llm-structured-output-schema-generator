export type FieldType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
export interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  nullable: boolean;
  enumValues: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  itemType: FieldType;
  children: FieldConfig[];
  defaultValue: string;
}
export interface BuilderConfig {
  name: string;
  description: string;
  additionalProperties: boolean;
  fields: FieldConfig[];
}
export type ProviderMode = 'standard' | 'openai' | 'generic';
