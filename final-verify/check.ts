import { RustPlugin } from '@cgasgarth/opencode-for-rust';

if (typeof RustPlugin !== 'function') {
  // eslint-disable-next-line no-console
  console.error('Failed: RustPlugin is not a function');
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log('WASM Plugin Loaded Successfully');
