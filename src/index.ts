import { Plugin, Hooks, tool } from '@opencode-ai/plugin';
import { RegexRustTypeExtractor } from './lib/regex-extractor';
import { RustTypeLookup } from './lib/lookup';
import { RustContentFormatter } from './lib/formatter';
import { TypeInjectionConfig } from './lib/types';
import { z } from 'zod';
import { appendFileSync } from 'fs';

const DEBUG_LOG = '/tmp/opencode-rust-plugin.log';

function debugLog(msg: string) {
  const timestamp = new Date().toISOString();
  appendFileSync(DEBUG_LOG, `[${timestamp}] ${msg}\n`);
}

export const RustPlugin: Plugin = async (context) => {
  debugLog(`Plugin initializing with context: ${JSON.stringify(context)}`);

  const config: TypeInjectionConfig = {
    enabled: true,
    debug: true,
    budget: 50,
    excludePatterns: [],
    imports: false,
  };

  const directory = context.directory || process.cwd();
  debugLog(`Using directory: ${directory}`);

  const lookup = new RustTypeLookup(directory, config);
  const formatter = new RustContentFormatter(config);
  const extractor = new RegexRustTypeExtractor(config);

  debugLog('Created lookup, formatter, extractor');

  try {
    await lookup.refresh();
    debugLog('Initial refresh completed');
  } catch (e) {
    debugLog(`Initial refresh failed: ${e}`);
  }

  const hooks: Hooks = {
    tool: {
      lookup_type: tool({
        description: 'Find a Rust type definition by name',
        args: {
          name: z.string().describe('The name of the type to look up'),
        },
        async execute(args) {
          debugLog(`lookup_type called with: ${JSON.stringify(args)}`);
          try {
            await lookup.refresh();
            debugLog('lookup_type: refresh done');
            const type = await lookup.findType(args.name);
            debugLog(`lookup_type: findType result: ${type ? 'found' : 'not found'}`);
            if (!type) {
              return `Type '${args.name}' not found`;
            }
            const result = formatter.formatInjectedTypes([type]);
            debugLog(`lookup_type: returning ${result.length} chars`);
            return result;
          } catch (e) {
            debugLog(`lookup_type error: ${e}`);
            throw e;
          }
        },
      }),
      list_types: tool({
        description: 'List all available Rust type names in the project',
        args: {},
        async execute() {
          debugLog('list_types called');
          try {
            await lookup.refresh();
            debugLog('list_types: refresh done');
            const names = await lookup.listTypeNames();
            debugLog(`list_types: found ${names.length} types`);
            if (names.length === 0) {
              return 'No Rust types found in project';
            }
            return names.join('\n');
          } catch (e) {
            debugLog(`list_types error: ${e}`);
            throw e;
          }
        },
      }),
    },
    'tool.execute.after': async (input, output) => {
      debugLog(`tool.execute.after: tool=${input.tool}`);
      if (input.tool !== 'read') {
        return;
      }

      const metadata = output.metadata as { filePath?: string } | undefined;
      const filePath = metadata?.filePath;
      debugLog(`tool.execute.after: filePath=${filePath}`);

      if (!filePath || !filePath.endsWith('.rs')) {
        return;
      }

      try {
        const types = await extractor.extract(filePath);
        debugLog(`tool.execute.after: extracted ${types.length} types`);
        const formatted = formatter.formatInjectedTypes(types);

        if (formatted) {
          output.output = output.output + formatted;
          debugLog(`tool.execute.after: appended ${formatted.length} chars`);
        }
      } catch (error) {
        debugLog(`tool.execute.after error: ${error}`);
      }
    },
  };

  debugLog('Hooks created, returning');
  return hooks;
};

export default RustPlugin;
