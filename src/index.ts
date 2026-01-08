import { Plugin, tool } from '@opencode-ai/plugin';
import { RustTypeExtractor } from './lib/extractor';
import { RustTypeLookup } from './lib/lookup';
import { RustContentFormatter } from './lib/formatter';
import { TypeInjectionConfig } from './lib/types';
import * as path from 'path';

export const RustPlugin: Plugin = async (context) => {
  const config: TypeInjectionConfig = {
    enabled: true,
    debug: false,
    budget: 50,
    excludePatterns: [],
    imports: false,
  };

  const lookup = new RustTypeLookup(context.directory, config);
  const formatter = new RustContentFormatter(config);
  const extractor = new RustTypeExtractor(config);

  return {
    hooks: {
      'tool.execute.after': async (args, result) => {
        if (args.tool !== 'read' || !config.enabled) return result;
        
        const filePath = args.args.filePath as string;
        if (!filePath || !filePath.endsWith('.rs')) return result;

        try {
            await lookup.refresh();
            const types = await extractor.extract(filePath, result.content);
            const formatted = formatter.formatInjectedTypes(types);
            if (formatted) {
                return {
                    ...result,
                    content: result.content + formatted
                };
            }
        } catch (error) {
           if (config.debug) {
             throw error;
           }
        }

        return result;
      }
    },
    tool: {
      lookup_type: tool({
        description: 'Find a Rust type definition by name',
        args: {
          name: tool.schema.string().describe('The name of the type to find'),
        },
        async execute(args) {
          const type = await lookup.findType(args.name);
          if (!type) return `Type "${args.name}" not found.`;
          return type.body || type.signature;
        },
      }),
      list_types: tool({
        description: 'List all available Rust type names in the project',
        args: {},
        async execute() {
          const types = await lookup.listTypeNames();
          return types.join('\n');
        },
      })
    }
  };
};

export default RustPlugin;
