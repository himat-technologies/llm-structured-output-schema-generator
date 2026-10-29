import type { ProviderMode } from '../types/schema';

export interface CompatibilityIssue { path: string; message: string; severity: 'warning' | 'error'; }
export function checkCompatibility(schema: Record<string, any>, provider: ProviderMode): CompatibilityIssue[] {
  if (provider !== 'openai') return [];
  const issues: CompatibilityIssue[] = [];
  const walk = (node: any, path: string) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'object' && node.additionalProperties !== false) {
      issues.push({ path, message: 'Strict mode expects additionalProperties: false for objects.', severity: 'error' });
    }
    if (node.type === 'object') {
      const keys = Object.keys(node.properties ?? {});
      const required = node.required ?? [];
      const missing = keys.filter(k => !required.includes(k));
      if (missing.length) issues.push({ path, message: `Strict mode expects all properties to be required. Consider nullable types for: ${missing.join(', ')}.`, severity: 'error' });
      for (const [key, child] of Object.entries(node.properties ?? {})) walk(child, `${path}/properties/${key}`);
    }
    if (node.items) walk(node.items, `${path}/items`);
    for (const keyword of ['minimum','maximum','minLength','maxLength','minItems','maxItems','default']) {
      if (keyword in node) issues.push({ path, message: `Keyword "${keyword}" may not be supported in all Structured Outputs contexts; verify provider support.`, severity: 'warning' });
    }
  };
  walk(schema, '#');
  return issues;
}
