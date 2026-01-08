/* eslint-disable no-console */
import { RustTypeExtractor } from '../src/lib/extractor';
import { RustTypeLookup } from '../src/lib/lookup';
import { RustContentFormatter } from '../src/lib/formatter';
import { TypeInjectionConfig } from '../src/lib/types';
import * as path from 'path';

async function main() {
  const mockProjectDir = path.join(process.cwd(), 'mockRustProject');
  const config: TypeInjectionConfig = {
    enabled: true,
    debug: true,
    budget: 1000,
    excludePatterns: [],
    imports: false,
  };

  console.log('--- Initializing Rust Plugin Components ---');
  const lookup = new RustTypeLookup(mockProjectDir, config);
  const extractor = new RustTypeExtractor(config);
  const formatter = new RustContentFormatter(config);

  console.log('--- Refreshing Lookup Cache ---');
  await lookup.refresh();

  const typeNames = await lookup.listTypeNames();
  console.log(`Found ${typeNames.length} types:`, typeNames.join(', '));

  if (typeNames.length === 0) {
    console.error('FAILED: No types found in mock project.');
    process.exit(1);
  }

  const expectedTypes = [
    'User',
    'Status',
    'Displayable',
    'create_user',
    'MAX_USERS',
    'Session',
    'validate_session',
    'UserId',
  ];
  const missingTypes = expectedTypes.filter((t) => !typeNames.includes(t));

  if (missingTypes.length > 0) {
    console.error('FAILED: Missing expected types:', missingTypes.join(', '));
    process.exit(1);
  }

  console.log('--- Testing Extraction on main.rs ---');
  const mainRsPath = path.join(mockProjectDir, 'src/main.rs');
  const extracted = await extractor.extract(mainRsPath);
  console.log(`Extracted ${extracted.length} items from main.rs`);

  if (extracted.length === 0) {
    console.error('FAILED: No items extracted from main.rs');
    process.exit(1);
  }

  console.log('--- Testing Formatting ---');
  const formatted = formatter.formatInjectedTypes(extracted);
  console.log('Formatted Output Preview:');
  console.log(formatted.substring(0, 500) + '...');

  const expectedComment = '/' + '* Injected Rust Types *' + '/';
  if (!formatted.includes(expectedComment) || !formatted.includes('pub struct User')) {
    console.error('FAILED: Formatting seems incorrect.');
    process.exit(1);
  }

  console.log('--- Testing Lookup Specific Type ---');
  const userType = await lookup.findType('User');
  if (!userType) {
    console.error('FAILED: Could not lookup "User" type.');
    process.exit(1);
  }
  console.log('Found User type:', userType.signature);

  console.log('VERIFICATION SUCCESSFUL');
}

main().catch((err) => {
  console.error('Verification Script Failed:', err);
  process.exit(1);
});
