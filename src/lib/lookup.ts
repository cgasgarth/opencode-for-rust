import * as path from 'path';
import * as fs from 'fs/promises';
import { RegexRustTypeExtractor } from './regex-extractor';
import { ExtractedType, TypeInjectionConfig } from './types';

async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.rs')) {
      yield fullPath;
    }
  }
}

export class RustTypeLookup {
  private extractor: RegexRustTypeExtractor;
  private cache = new Map<string, ExtractedType>();
  private lastScanTime = 0;

  constructor(
    private directory: string,
    private config: TypeInjectionConfig
  ) {
    this.extractor = new RegexRustTypeExtractor(config);
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

    for await (const absolutePath of walkDir(this.directory)) {
      const relativePath = path.relative(this.directory, absolutePath);
      if (this.shouldExclude(relativePath)) continue;

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
