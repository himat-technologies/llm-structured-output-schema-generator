import { describe, expect, it } from 'vitest';
import { generateSample, generateSchema } from './schemaGenerator';
import type { BuilderConfig, FieldConfig } from '../types/schema';

const field = (name: string, type: FieldConfig['type'], required = true): FieldConfig => ({
  id: name, name, type, description: '', required, nullable: false, enumValues: '', itemType: 'string', children: [], defaultValue: ''
});
const config: BuilderConfig = { name: 'Test', description: 'Test schema', additionalProperties: false, fields: [field('name','string'), field('age','integer',false)] };

describe('schema generator', () => {
  it('generates object schema and required fields', () => {
    const schema = generateSchema(config);
    expect(schema.type).toBe('object');
    expect(schema.required).toEqual(['name']);
    expect((schema.properties as any).age.type).toBe('integer');
  });
  it('uses strict object requirements in OpenAI mode', () => {
    const schema = generateSchema(config, 'openai');
    expect(schema.required).toEqual(['name','age']);
    expect((schema.properties as any).age.type).toEqual(['integer','null']);
    expect(schema.additionalProperties).toBe(false);
  });
  it('generates representative sample data', () => {
    const schema = generateSchema(config);
    expect(generateSample(schema)).toEqual({ name: 'example' });
  });
});
