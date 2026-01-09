import * as fs from 'fs/promises';
import { ExtractedType, RustTypeKind, TypeInjectionConfig } from './types';

const PATTERNS: { kind: RustTypeKind; regex: RegExp }[] = [
  {
    kind: 'struct',
    regex:
      /^(\s*(?:\/\/\/.*\n)*)(pub(?:\([^)]*\))?\s+)?struct\s+(\w+)(?:<[^>]*>)?(?:\s*\{[\s\S]*?\n\}|\s*;)/gm,
  },
  {
    kind: 'enum',
    regex:
      /^(\s*(?:\/\/\/.*\n)*)(pub(?:\([^)]*\))?\s+)?enum\s+(\w+)(?:<[^>]*>)?(?:\s*\{[\s\S]*?\n\})/gm,
  },
  {
    kind: 'trait',
    regex:
      /^(\s*(?:\/\/\/.*\n)*)(pub(?:\([^)]*\))?\s+)?trait\s+(\w+)(?:<[^>]*>)?(?:\s*\{[\s\S]*?\n\})/gm,
  },
  {
    kind: 'function',
    regex:
      /^(\s*(?:\/\/\/.*\n)*)(pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+(\w+)(?:<[^>]*>)?\s*\([^)]*\)(?:\s*->\s*[^{]+)?(?:\s*where[^{]*)?\s*\{/gm,
  },
  {
    kind: 'type_alias',
    regex: /^(\s*(?:\/\/\/.*\n)*)(pub(?:\([^)]*\))?\s+)?type\s+(\w+)(?:<[^>]*>)?\s*=\s*[^;]+;/gm,
  },
  {
    kind: 'const',
    regex: /^(\s*(?:\/\/\/.*\n)*)(pub(?:\([^)]*\))?\s+)?const\s+(\w+)\s*:\s*[^=]+=\s*[^;]+;/gm,
  },
  {
    kind: 'impl',
    regex: /^(\s*)impl(?:<[^>]*>)?\s+(?:(\w+)\s+for\s+)?(\w+)(?:<[^>]*>)?(?:\s*where[^{]*)?\s*\{/gm,
  },
];

export class RegexRustTypeExtractor {
  constructor(private config: TypeInjectionConfig) {}

  async extract(filePath: string, content?: string): Promise<ExtractedType[]> {
    const fileContent = content || (await fs.readFile(filePath, 'utf-8'));
    const types: ExtractedType[] = [];

    for (const { kind, regex } of PATTERNS) {
      regex.lastIndex = 0;
      let match;

      while ((match = regex.exec(fileContent)) !== null) {
        const docComment = match[1]?.trim() || undefined;
        const visibility = match[2]?.trim();
        const name = match[3];
        const exported = visibility?.startsWith('pub') ?? false;

        const startIndex = match.index;
        const lineStart = fileContent.substring(0, startIndex).split('\n').length;

        let body = match[0];
        if (kind === 'function' || kind === 'trait' || kind === 'impl') {
          body = this.extractFullBody(fileContent, startIndex);
        }

        const lineEnd = lineStart + body.split('\n').length - 1;
        const signature = body.split('\n')[0];

        types.push({
          name,
          kind,
          signature,
          docComment: docComment || undefined,
          exported,
          filePath,
          lineStart,
          lineEnd,
          body,
        });
      }
    }

    return types;
  }

  private extractFullBody(content: string, startIndex: number): string {
    let braceCount = 0;
    let started = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      if (char === '{') {
        braceCount++;
        started = true;
      } else if (char === '}') {
        braceCount--;
        if (started && braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    return content.substring(startIndex, endIndex);
  }
}
