import { Glob } from 'bun';
import * as path from 'path';
import { RustTypeExtractor } from './extractor';
import { ExtractedType, TypeInjectionConfig } from './types';

export class RustTypeLookup {
  private extractor: RustTypeExtractor;
  private cache: Map<string, ExtractedType> = new Map();
  private lastScanTime: number = 0;

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
    const glob = new Glob('**/*.rs');
    
    for await (const filePath of glob.scan(this.directory)) {
      if (this.shouldExclude(filePath)) continue;

      const absolutePath = path.join(this.directory, filePath);
      try {
        const types = await this.extractor.extract(absolutePath);
        for (const type of types) {
          if (type.name) {
            this.cache.set(type.name, type);
          }
        }
      } catch (error) {
        continue;
      }
    }
    this.lastScanTime = Date.now();
  }

  private async ensureCache(): Promise<void> {
    if (this.cache.size === 0) {
      await this.refresh();
    }
  }

  private shouldExclude(filePath: string): boolean {
    return this.config.excludePatterns.some(pattern => filePath.includes(pattern));
  }
}
