import type { BuilderConfig, FieldConfig } from '../types/schema';

export const SCHEMA_DRAFT = 'https://json-schema.org/draft/2020-12/schema';

function parseEnum(raw: string): string[] | undefined {
  const values = raw.split(',').map(v => v.trim()).filter(Boolean);
  return values.length ? values : undefined;
}

function fieldSchema(field: FieldConfig): Record<string, unknown> {
  const schema: Record<string, unknown> = { type: field.nullable && field.type !== 'null' ? [field.type, 'null'] : field.type };
  if (field.description.trim()) schema.description = field.description.trim();
  if (field.defaultValue.trim()) {
    try { schema.default = JSON.parse(field.defaultValue); }
    catch { schema.default = field.defaultValue; }
  }
  const enumValues = parseEnum(field.enumValues);
  if (enumValues) schema.enum = enumValues;
  if (field.type === 'string') {
    if (field.minLength !== undefined) schema.minLength = field.minLength;
    if (field.maxLength !== undefined) schema.maxLength = field.maxLength;
  }
  if (field.type === 'number' || field.type === 'integer') {
    if (field.min !== undefined) schema.minimum = field.min;
    if (field.max !== undefined) schema.maximum = field.max;
  }
  if (field.type === 'object') {
    schema.properties = Object.fromEntries(field.children.filter(c => c.name.trim()).map(c => [c.name.trim(), fieldSchema(c)]));
    const required = field.children.filter(c => c.required && c.name.trim()).map(c => c.name.trim());
    if (required.length) schema.required = required;
    schema.additionalProperties = false;
  }
  if (field.type === 'array') {
    schema.items = { type: field.itemType === 'null' ? 'null' : field.itemType };
    if (field.itemType === 'object') {
      schema.items = { type: 'object', properties: {}, additionalProperties: true };
    }
    if (field.minItems !== undefined) schema.minItems = field.minItems;
    if (field.maxItems !== undefined) schema.maxItems = field.maxItems;
  }
  return schema;
}

export function generateSchema(config: BuilderConfig, provider: 'standard' | 'openai' | 'generic' = 'standard'): Record<string, unknown> {
  const properties = Object.fromEntries(config.fields.filter(f => f.name.trim()).map(f => [f.name.trim(), fieldSchema(f)]));
  const required = config.fields.filter(f => f.required && f.name.trim()).map(f => f.name.trim());
  const schema: Record<string, unknown> = {
    $schema: SCHEMA_DRAFT,
    title: config.name.trim() || 'GeneratedSchema',
    description: config.description.trim() || 'A structured response schema for an LLM.',
    type: 'object',
    properties,
    required,
    additionalProperties: config.additionalProperties
  };
  if (provider === 'openai') {
    schema.additionalProperties = false;
    schema.required = Object.keys(properties);
    // OpenAI strict mode requires every property to be required; optionality is represented with nullable types.
    for (const [key, value] of Object.entries(properties)) {
      const v = value as Record<string, unknown>;
      if (Array.isArray(v.type) && v.type.includes('null')) continue;
      if (required.includes(key)) continue;
      v.type = Array.isArray(v.type) ? v.type : [v.type, 'null'];
    }
  }
  return schema;
}

export function generateSample(schema: Record<string, any>): unknown {
  if (schema.enum?.length) return schema.enum[0];
  const type = Array.isArray(schema.type) ? schema.type.find((t: string) => t !== 'null') : schema.type;
  if (type === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      const child = value as Record<string, any>;
      if ((schema.required ?? []).includes(key)) result[key] = generateSample(child);
    }
    return result;
  }
  if (type === 'array') {
    const count = Math.max(1, schema.minItems ?? 1);
    return Array.from({ length: Math.min(count, 3) }, () => generateSample(schema.items ?? { type: 'string' }));
  }
  if (type === 'string') {
    const value = schema.minLength && schema.minLength > 7 ? 'example-value' : 'example';
    return value;
  }
  if (type === 'number') return Math.max(schema.minimum ?? 12.5, 12.5);
  if (type === 'integer') return Math.max(schema.minimum ?? 10, 10);
  if (type === 'boolean') return true;
  return null;
}
