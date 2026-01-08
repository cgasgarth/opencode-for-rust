import { describe, it, expect, beforeEach } from 'bun:test';
import { RustTypeLookup } from '../src/lib/lookup';
import { TypeInjectionConfig } from '../src/lib/types';
import * as path from 'path';

describe('RustTypeLookup', () => {
  const config: TypeInjectionConfig = {
    enabled: true,
    debug: false,
    budget: 1000,
    excludePatterns: [],
    imports: false,
  };

  const mockProjectDir = path.join(process.cwd(), 'mockRustProject');
  let lookup: RustTypeLookup;

  beforeEach(() => {
    lookup = new RustTypeLookup(mockProjectDir, config);
  });

  it('should find types in the mock project', async () => {
    await lookup.refresh();

    const userType = await lookup.findType('User');
    expect(userType).toBeDefined();
    expect(userType?.kind).toBe('struct');

    const types = await lookup.listTypeNames();
    expect(types).toContain('User');
    expect(types).toContain('Status');
    expect(types).toContain('create_user');
  });

  it('should return undefined for non-existent types', async () => {
    await lookup.refresh();
    const result = await lookup.findType('NonExistentType');
    expect(result).toBeUndefined();
  });
});
