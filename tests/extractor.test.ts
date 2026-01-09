import { describe, it, expect } from 'bun:test';
import { RegexRustTypeExtractor } from '../src/lib/regex-extractor';
import { TypeInjectionConfig } from '../src/lib/types';
import * as path from 'path';

describe('RegexRustTypeExtractor', () => {
  const config: TypeInjectionConfig = {
    enabled: true,
    debug: false,
    budget: 1000,
    excludePatterns: [],
    imports: false,
  };

  const extractor = new RegexRustTypeExtractor(config);
  const mockProjectDir = path.join(process.cwd(), 'mockRustProject');

  it('should extract types from a Rust file', async () => {
    const filePath = path.join(mockProjectDir, 'src/main.rs');
    const types = await extractor.extract(filePath);

    expect(types.length).toBeGreaterThan(0);

    const userStruct = types.find((t) => t.name === 'User');
    expect(userStruct).toBeDefined();
    expect(userStruct?.kind).toBe('struct');
    expect(userStruct?.exported).toBe(true);

    const statusEnum = types.find((t) => t.name === 'Status');
    expect(statusEnum).toBeDefined();
    expect(statusEnum?.kind).toBe('enum');

    const createUserFn = types.find((t) => t.name === 'create_user');
    expect(createUserFn).toBeDefined();
    expect(createUserFn?.kind).toBe('function');
  });

  it('should extract types from content string', async () => {
    const content = `
      pub struct TestStruct {
        field: u32
      }
      
      fn private_fn() {
        println!("hello");
      }
    `;

    const types = await extractor.extract('virtual.rs', content);

    expect(types.length).toBe(2);
    expect(types[0].name).toBe('TestStruct');
    expect(types[0].kind).toBe('struct');
    expect(types[0].exported).toBe(true);

    expect(types[1].name).toBe('private_fn');
    expect(types[1].kind).toBe('function');
    expect(types[1].exported).toBe(false);
  });
});
