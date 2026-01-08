import Parser from 'tree-sitter';
import Rust from 'tree-sitter-rust';
import * as fs from 'fs/promises';
import { ExtractedType, RustTypeKind, TypeInjectionConfig } from './types';

export class RustTypeExtractor {
  private parser: Parser;

  constructor(private config: TypeInjectionConfig) {
    this.parser = new Parser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.parser.setLanguage(Rust as any);
  }

  async extract(filePath: string, content?: string): Promise<ExtractedType[]> {
    const _fileContent = content || (await fs.readFile(filePath, 'utf-8'));
    const tree = this.parser.parse(_fileContent);
    const types: ExtractedType[] = [];

    const query = new Parser.Query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rust as any,
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
      const typeNode = match.captures.find((c) => c.name !== 'name')?.node;
      const nameNode = match.captures.find((c) => c.name === 'name')?.node;

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

  private isExported(node: Parser.SyntaxNode): boolean {
    return node.children.some(
      (child) => child.type === 'visibility_modifier' && child.text.includes('pub')
    );
  }

  private getDocComment(node: Parser.SyntaxNode): string | undefined {
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

  private getSignature(node: Parser.SyntaxNode, _fileContent: string): string {
    if (node.type === 'function_item') {
      const lines = node.text.split('\n');
      return lines[0];
    }
    const lines = node.text.split('\n');
    return lines[0];
  }
}
