import { describe, expect, it } from 'vitest';
import { checkCompatibility } from './providerCompatibility';
describe('provider compatibility', () => {
  it('does not warn for generic mode', () => {
    expect(checkCompatibility({type:'object', properties:{}}, 'generic')).toEqual([]);
  });
  it('flags strict object requirements', () => {
    const issues = checkCompatibility({type:'object', additionalProperties:true, properties:{name:{type:'string'}}, required:[]}, 'openai');
    expect(issues.length).toBeGreaterThan(0);
  });
});
