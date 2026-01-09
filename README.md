# @cgasgarth/opencode-for-rust

OpenCode plugin for Rust

> **Note**: This plugin is designed to work with [OpenCode](https://opencode.ai).

## Features

- Automatic Type Injection: Automatically analyzes Rust files and injects an outline of defined types (structs, enums, traits, functions) at the end of file content when you read a `.rs` file.
- Type Lookup: Includes a `lookup_type` tool to find specific Rust type definitions by name across the entire project.
- Type Listing: Includes a `list_types` tool to see all available Rust types in the project.
- Regex-based Parser: Uses a lightweight, zero-dependency regex-based parser that works reliably in all JavaScript environments (Node.js, Bun, OpenCode).
- Zero Configuration: Works out of the box for standard Rust projects.

## Tools

### `lookup_type`

Find a Rust type definition by name.

- **name**: The name of the type to find (e.g., `MyStruct`).

### `list_types`

List all available Rust type names in the project.

## Development

### Prerequisites

- [Bun](https://bun.sh)
- [Mise](https://mise.jdx.dev) (optional)

### Scripts

- `mise run build` - Build the plugin
- `mise run test` - Run tests
- `mise run lint` - Lint code
- `mise run lint:fix` - Fix linting issues
- `mise run format` - Format code

## Installation

Add this plugin to your OpenCode configuration (`~/.config/opencode/config.json`):

```json
{
  "plugins": ["@cgasgarth/opencode-for-rust"]
}
```

## Repository

https://github.com/cgasgarth/opencode-for-rust

## License

MIT

## Known Limitations

**Automatic Type Injection**: The hook for automatic type injection when reading `.rs` files is currently not functional in OpenCode's environment. This appears to be due to differences in how OpenCode's plugin system processes hook registration or type expectations compared to the TypeScript plugin.

**Manual Tools**: The following tools work correctly and can be used as alternatives:

- `lookup_type`: Successfully retrieves Rust type definitions by name (verified: 413 types found in kalshi-tools)
- `list_types`: Successfully lists all Rust type names in the project (verified: 413 types found in kalshi-tools)

The plugin loads without errors and uses a cross-platform regex-based parser that eliminates the WASM dependency issues that caused earlier crashes.
