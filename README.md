# @cgasgarth/opencode-for-rust

OpenCode plugin for Rust

> **Note**: This plugin is designed to work with [OpenCode](https://opencode.ai).

## Features

- Automatic Type Injection: Automatically analyzes Rust files and injects relevant type definitions (structs, enums, traits) into the context when you read a file.
- Type Lookup: Includes a `lookup_type` tool to find specific Rust type definitions by name.
- Type Listing: Includes a `list_types` tool to see all available Rust types in the project.
- Tree-Sitter Powered: Uses `tree-sitter-rust` for robust and fast code analysis.
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
