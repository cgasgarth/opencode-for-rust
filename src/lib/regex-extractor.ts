import * as fs from 'fs';
import { ExtractedType, RustTypeKind, TypeInjectionConfig } from './types';

const PATTERNS: { kind: RustTypeKind; regex: RegExp; useBodyExtractor?: boolean }[] = [
  {
    kind: 'struct',
    regex:
      /(?:^|\n)(\s*(?:\/\/\/.*\n)*)(\s*pub(?:\([^)]*\))?\s+)?struct\s+(\w+)(?:<[^>]*>)?(?:\s*\{|\s*;)/g,
    useBodyExtractor: true,
  },
  {
    kind: 'enum',
    regex:
      /(?:^|\n)(\s*(?:\/\/\/.*\n)*)(\s*pub(?:\([^)]*\))?\s+)?enum\s+(\w+)(?:<[^>]*>)?(?:\s*\{)/g,
    useBodyExtractor: true,
  },
  {
    kind: 'trait',
    regex:
      /(?:^|\n)(\s*(?:\/\/\/.*\n)*)(\s*pub(?:\([^)]*\))?\s+)?trait\s+(\w+)(?:<[^>]*>)?(?:\s*\{)/g,
    useBodyExtractor: true,
  },
  {
    kind: 'function',
    regex:
      /(?:^|\n)(\s*(?:\/\/\/.*\n)*)(\s*pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+(\w+)(?:<[^>]*>)?\s*\([^)]*\)(?:\s*->\s*[^{]+)?(?:\s*where[^{]*)?\s*\{/g,
    useBodyExtractor: true,
  },
  {
    kind: 'type_alias',
    regex:
      /(?:^|\n)(\s*(?:\/\/\/.*\n)*)(\s*pub(?:\([^)]*\))?\s+)?type\s+(\w+)(?:<[^>]*>)?\s*=\s*[^;]+;/g,
  },
  {
    kind: 'const',
    regex:
      /(?:^|\n)(\s*(?:\/\/\/.*\n)*)(\s*pub(?:\([^)]*\))?\s+)?const\s+(\w+)\s*:\s*[^=]+=\s*[^;]+;/g,
  },
  {
    kind: 'impl',
    regex:
      /(?:^|\n)(\s*)impl(?:<[^>]*>)?\s+(?:(\w+)\s+for\s+)?(\w+)(?:<[^>]*>)?(?:\s*where[^{]*)?\s*\{/g,
    useBodyExtractor: true,
  },
];

export class RegexRustTypeExtractor {
  constructor(private config: TypeInjectionConfig) {}

  async extract(filePath: string, content?: string): Promise<ExtractedType[]> {
    const fileContent = content || (await fs.promises.readFile(filePath, 'utf-8'));
    const types: ExtractedType[] = [];

    for (const { kind, regex, useBodyExtractor } of PATTERNS) {
      regex.lastIndex = 0;
      let match;

      while ((match = regex.exec(fileContent)) !== null) {
        const docComment = match[1]?.trim() || undefined;
        const visibility = match[2]?.trim();
        const name = match[3];
        const exported = visibility?.startsWith('pub') ?? false;

        // startIndex should be after the newline (if matched by group 0)
        // If the match starts with a newline (match[0][0] === '\n'), add 1
        const matchStart = match.index + (match[0].startsWith('\n') ? 1 : 0);

        const lineStart = fileContent.substring(0, matchStart).split('\n').length;

        let body = match[0].startsWith('\n') ? match[0].substring(1) : match[0];

        // Handle struct shorthand (semicolon case)
        if (kind === 'struct' && body.trim().endsWith(';')) {
          // It's a tuple struct or unit struct, body is already captured correctly by regex
        } else if (useBodyExtractor) {
          // Find the opening brace position
          // matchStart + body.length might include '{' but we need to find it exactly
          const braceIndex = fileContent.indexOf('{', matchStart);
          if (braceIndex !== -1) {
            body = this.extractFullBody(fileContent, matchStart);
          }
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
