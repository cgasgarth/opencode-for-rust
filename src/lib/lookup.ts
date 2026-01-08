import { Glob } from 'bun';
import * as path from 'path';
import { RustTypeExtractor } from './extractor';
import { ExtractedType, TypeInjectionConfig } from './types';

export class RustTypeLookup {
  private extractor: RustTypeExtractor;
  private cache = new Map<string, ExtractedType>();
  private lastScanTime = 0;

  constructor(
    private directory: string,
    private config: TypeInjectionConfig
  ) {
    this.extractor = new RustTypeExtractor(config);
  }

  async findType(name: string): Promise<ExtractedType | undefined> {
    await this.ensureCache();
    return this.cache.get(name);
  }

  async listTypeNames(): Promise<string[]> {
    await this.ensureCache();
    return Array.from(this.cache.keys());
  }

  async refresh(): Promise<void> {
    this.cache.clear();
    const glob = new Glob('**' + '/' + '*.rs');

    for await (const filePath of glob.scan(this.directory)) {
      if (this.shouldExclude(filePath)) continue;

      const absolutePath = path.join(this.directory, filePath);
      try {
        const types = await this.extractor.extract(absolutePath);
        for (const type of types) {
          if (type.name) {
            const existing = this.cache.get(type.name);
            if (!existing || this.getPriority(type.kind) < this.getPriority(existing.kind)) {
              this.cache.set(type.name, type);
            }
          }
        }
      } catch {
        continue;
      }
    }
    this.lastScanTime = Date.now();
  }

  private getPriority(kind: string): number {
    const priority: Record<string, number> = {
      struct: 1,
      enum: 1,
      trait: 1,
      type_alias: 1,
      const: 2,
      function: 3,
      macro: 4,
      impl: 10,
    };
    return priority[kind] || 99;
  }

  private async ensureCache(): Promise<void> {
    if (this.cache.size === 0) {
      await this.refresh();
    }
  }

  private shouldExclude(filePath: string): boolean {
    return this.config.excludePatterns.some((pattern) => filePath.includes(pattern));
  }
}
