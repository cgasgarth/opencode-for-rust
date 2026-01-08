import { ExtractedType, TypeInjectionConfig } from './types';

export class RustContentFormatter {
  constructor(private config: TypeInjectionConfig) {}

  formatInjectedTypes(types: ExtractedType[]): string {
    if (types.length === 0) return '';

    const sortedTypes = this.sortTypes(types);
    const startComment = '/' + '* Injected Rust Types *' + '/';
    const endComment = '/' + '* End Injected Rust Types *' + '/';
    const header = '\n\n' + startComment + '\n';

    const formattedTypes = sortedTypes.map((type) => {
      let output = '';
      if (type.docComment) {
        output += `${type.docComment}\n`;
      }
      output += type.body || type.signature;
      return output;
    });

    return header + formattedTypes.join('\n\n') + '\n' + endComment + '\n';
  }

  private sortTypes(types: ExtractedType[]): ExtractedType[] {
    return types.sort((a, b) => {
      const priority = {
        struct: 1,
        enum: 2,
        trait: 3,
        type_alias: 4,
        function: 5,
        impl: 6,
        const: 7,
        macro: 8,
      };

      const pA = priority[a.kind] || 99;
      const pB = priority[b.kind] || 99;

      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }
}
