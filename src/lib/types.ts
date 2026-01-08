export type RustTypeKind =
  | 'function'
  | 'struct'
  | 'enum'
  | 'trait'
  | 'type_alias'
  | 'impl'
  | 'const'
  | 'macro';

export interface RustType {
  name: string;
  kind: RustTypeKind;
  signature: string;
  docComment?: string;
  exported: boolean;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  body?: string;
}

export interface TypeInjectionConfig {
  enabled: boolean;
  debug: boolean;
  budget: number;
  excludePatterns: string[];
  imports: boolean;
}

export interface ExtractedType extends RustType {
  isUsed?: boolean;
}
