import Ajv2020 from 'ajv/dist/2020';
const ajv = new Ajv2020({ allErrors: true, strict: false });
export function validateSchema(schema: unknown): { valid: boolean; errors: string[] } {
  try {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return { valid: false, errors: ['Schema root must be a JSON object.'] };
    const candidate = schema as Record<string, unknown>;
    if (candidate.type !== 'object' && candidate.type !== 'array' && !['string','number','integer','boolean','null'].includes(String(candidate.type))) {
      return { valid: false, errors: ['Set a supported root type such as object, array, string, number, integer, boolean, or null.'] };
    }
    const validate = ajv.compile(candidate);
    return { valid: true, errors: validate.errors?.map(e => `${e.instancePath || '#'} ${e.message ?? 'is invalid'}`) ?? [] };
  } catch (error) {
    return { valid: false, errors: [error instanceof Error ? error.message : 'Unable to compile this schema.'] };
  }
}
