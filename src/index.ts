import { Plugin, tool } from '@opencode-ai/plugin';
import { RegexRustTypeExtractor } from './lib/regex-extractor';
import { RustTypeLookup } from './lib/lookup';
import { RustContentFormatter } from './lib/formatter';
import { TypeInjectionConfig } from './lib/types';

export const RustPlugin: Plugin = async (context) => {
  const config: TypeInjectionConfig = {
    enabled: true,
    debug: false,
    budget: 50,
    excludePatterns: [],
    imports: false,
  };

  const directory = context.directory || (context as { cwd?: string }).cwd || process.cwd();
  const lookup = new RustTypeLookup(directory, config);
  const formatter = new RustContentFormatter(config);
  const extractor = new RegexRustTypeExtractor(config);

  return {
    hooks: {
      'tool.execute.after': async (
        args: { tool: string; args: { filePath?: string } },
        result: { content: string }
      ) => {
        if (args.tool !== 'read' || !config.enabled) return result;

        const filePath = args.args.filePath;
        if (!filePath || !filePath.endsWith('.rs')) return result;

        try {
          await lookup.refresh();
          const types = await extractor.extract(filePath, result.content);
          const formatted = formatter.formatInjectedTypes(types);
          if (formatted) {
            return {
              ...result,
              content: result.content + formatted,
            };
          }
        } catch (error) {
          if (config.debug) {
            throw error;
          }
        }

        return result;
      },
    },
    tool: {
      lookup_type: tool({
        description: 'Find a Rust type definition by name',
        args: {
          name: tool.schema.string().describe('The name of the type to find'),
        },
        async execute(args) {
          try {
            const type = await lookup.findType(args.name);
            if (!type) return `Type "${args.name}" not found.`;
            return type.body || type.signature;
          } catch (error) {
            return `Error looking up type: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),
      list_types: tool({
        description: 'List all available Rust type names in the project',
        args: {},
        async execute() {
          try {
            const types = await lookup.listTypeNames();
            return types.join('\n');
          } catch (error) {
            return `Error listing types: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),
    },
  };
};

export default RustPlugin;
