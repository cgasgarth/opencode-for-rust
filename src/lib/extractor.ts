import { Parser, Language, Query, Node, QueryCapture } from 'web-tree-sitter';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { ExtractedType, RustTypeKind, TypeInjectionConfig } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirnameResolved = path.dirname(__filename);
const WASM_PATH = path.resolve(__dirnameResolved, 'tree-sitter-rust.wasm');

export class RustTypeExtractor {
  private parser: Parser | null = null;
  private language: Language | null = null;

  constructor(private config: TypeInjectionConfig) {}

  async init(): Promise<void> {
    if (this.parser) return;

    try {
      await Parser.init();
    } catch (e) {
      throw new Error(`Parser.init() failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    this.parser = new Parser();

    try {
      this.language = await Language.load(WASM_PATH);
      this.parser.setLanguage(this.language);
    } catch (e) {
      throw new Error(
        `Language.load(${WASM_PATH}) failed: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  async extract(filePath: string, content?: string): Promise<ExtractedType[]> {
    if (!this.parser) {
      await this.init();
    }

    if (!this.parser || !this.language) {
      return [];
    }

    const _fileContent = content || (await fs.readFile(filePath, 'utf-8'));
    const tree = this.parser.parse(_fileContent);

    if (!tree) {
      return [];
    }

    const types: ExtractedType[] = [];

    const query = new Query(
      this.language,
      `
      (struct_item
        name: (type_identifier) @name
      ) @struct

      (enum_item
        name: (type_identifier) @name
      ) @enum

      (trait_item
        name: (type_identifier) @name
      ) @trait

      (function_item
        name: (identifier) @name
      ) @function

      (type_item
        name: (type_identifier) @name
      ) @type_alias

      (const_item
        name: (identifier) @name
      ) @const

      (impl_item
        type: (type_identifier) @name
      ) @impl
      `
    );

    const matches = query.matches(tree.rootNode);

    for (const match of matches) {
      const typeNode = match.captures.find((c: QueryCapture) => c.name !== 'name')?.node;
      const nameNode = match.captures.find((c: QueryCapture) => c.name === 'name')?.node;

      if (!typeNode || !nameNode) continue;

      const kind = this.mapNodeToKind(typeNode.type);
      if (!kind) continue;

      const signature = this.getSignature(typeNode, _fileContent);
      const docComment = this.getDocComment(typeNode);
      const exported = this.isExported(typeNode);

      types.push({
        name: nameNode.text,
        kind,
        signature,
        docComment,
        exported,
        filePath,
        lineStart: typeNode.startPosition.row + 1,
        lineEnd: typeNode.endPosition.row + 1,
        body: typeNode.text,
      });
    }

    return types;
  }

  private mapNodeToKind(nodeType: string): RustTypeKind | undefined {
    switch (nodeType) {
      case 'struct_item':
        return 'struct';
      case 'enum_item':
        return 'enum';
      case 'trait_item':
        return 'trait';
      case 'function_item':
        return 'function';
      case 'type_item':
        return 'type_alias';
      case 'const_item':
        return 'const';
      case 'impl_item':
        return 'impl';
      default:
        return undefined;
    }
  }

  private isExported(node: Node): boolean {
    return node.children.some(
      (child: Node) => child.type === 'visibility_modifier' && child.text.includes('pub')
    );
  }

  private getDocComment(node: Node): string | undefined {
    let prev = node.previousSibling;
    const comments: string[] = [];
    while (prev && (prev.type === 'line_comment' || prev.type === 'block_comment')) {
      if (prev.text.startsWith('/' + '/' + '/') || prev.text.startsWith('/' + '**')) {
        comments.unshift(prev.text);
      }
      prev = prev.previousSibling;
    }
    return comments.length > 0 ? comments.join('\n') : undefined;
  }

  private getSignature(node: Node, _fileContent: string): string {
    if (node.type === 'function_item') {
      const lines = node.text.split('\n');
      return lines[0];
    }
    const lines = node.text.split('\n');
    return lines[0];
  }
}
