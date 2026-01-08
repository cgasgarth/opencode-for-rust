import { describe, it, expect } from 'bun:test';
import { RustContentFormatter } from '../src/lib/formatter';
import { TypeInjectionConfig, ExtractedType } from '../src/lib/types';

describe('RustContentFormatter', () => {
  const config: TypeInjectionConfig = {
    enabled: true,
    debug: false,
    budget: 1000,
    excludePatterns: [],
    imports: false,
  };

  const formatter = new RustContentFormatter(config);

  it('should format extracted types correctly', () => {
    const types: ExtractedType[] = [
      {
        name: 'User',
        kind: 'struct',
        signature: 'pub struct User { id: u64 }',
        exported: true,
        filePath: 'main.rs',
        lineStart: 1,
        lineEnd: 3,
        body: 'pub struct User {\n    id: u64\n}',
      },
    ];

    const result = formatter.formatInjectedTypes(types);

    const startComment = '/' + '* Injected Rust Types *' + '/';
    const endComment = '/' + '* End Injected Rust Types *' + '/';

    expect(result).toContain(startComment);
    expect(result).toContain('pub struct User {');
    expect(result).toContain(endComment);
  });

  it('should return empty string for empty types', () => {
    const result = formatter.formatInjectedTypes([]);
    expect(result).toBe('');
  });
});
