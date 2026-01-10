# Changelog

## [1.1.4](https://github.com/cgasgarth/opencode-for-rust/compare/v1.1.3...v1.1.4) (2026-01-10)


### Bug Fixes

* use tool.schema and externalize zod properly ([655e426](https://github.com/cgasgarth/opencode-for-rust/commit/655e426b90efc3c4ec5c6e3d37b65e511a651982))

## [1.1.3](https://github.com/cgasgarth/opencode-for-rust/compare/v1.1.2...v1.1.3) (2026-01-10)


### Bug Fixes

* externalize zod in mise build task ([5c92aa7](https://github.com/cgasgarth/opencode-for-rust/commit/5c92aa7377c794420b34e79df4640ba9b59c1870))

## [1.1.2](https://github.com/cgasgarth/opencode-for-rust/compare/v1.1.1...v1.1.2) (2026-01-10)


### Bug Fixes

* externalize zod to prevent version mismatch crashes ([#16](https://github.com/cgasgarth/opencode-for-rust/issues/16)) ([be46ae2](https://github.com/cgasgarth/opencode-for-rust/commit/be46ae25d83ca8e5bd14e2d4cfb2754782f970ed))
* use esbuild for bundling and add lookup_type/list_types tools ([3986983](https://github.com/cgasgarth/opencode-for-rust/commit/3986983867884884f42782ef2906a95ed582f045))

## [1.1.1](https://github.com/cgasgarth/opencode-for-rust/compare/v1.1.0...v1.1.1) (2026-01-09)


### Bug Fixes

* improve regex parser accuracy and fix tests ([33d441e](https://github.com/cgasgarth/opencode-for-rust/commit/33d441e87e96b96868f0e8241cc11f54f9ae9194))

## [1.1.0](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.10...v1.1.0) (2026-01-09)


### Features

* add final-verify test package for plugin validation ([7dfb2fa](https://github.com/cgasgarth/opencode-for-rust/commit/7dfb2fa21223839ea52537076ccfce2a64c79d23))


### Bug Fixes

* externalize @opencode-ai/plugin to reduce bundle size ([5328b46](https://github.com/cgasgarth/opencode-for-rust/commit/5328b46677d9f67ae7056ed8756b50f5742111f1))
* replace Bun Glob with Node.js-compatible walkDir ([0d1a417](https://github.com/cgasgarth/opencode-for-rust/commit/0d1a4177b506319c3491c5e23e7769840f036a0c))
* replace tree-sitter WASM with regex-based parser ([a86bc23](https://github.com/cgasgarth/opencode-for-rust/commit/a86bc23ff4bcbdc7ef630dfbe43f812c2ea235d0))
* use import.meta.url for runtime WASM path resolution ([09a70e3](https://github.com/cgasgarth/opencode-for-rust/commit/09a70e30028ada2529048c1e2b4adb86f97585c8))

## [1.0.10](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.9...v1.0.10) (2026-01-09)


### Bug Fixes

* **deps:** force upgrade web-tree-sitter to ^0.26.3 ([b0721fa](https://github.com/cgasgarth/opencode-for-rust/commit/b0721fa6e1b4fc36fc60a77b796ea46d723756bf))

## [1.0.9](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.8...v1.0.9) (2026-01-09)


### Bug Fixes

* use named imports for web-tree-sitter ([882e459](https://github.com/cgasgarth/opencode-for-rust/commit/882e459af8d4779219d139c33904612f0933e38c))

## [1.0.8](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.7...v1.0.8) (2026-01-09)


### Bug Fixes

* **deps:** update tree-sitter-rust to 0.24.0 to ensure wasm file exists ([93907e9](https://github.com/cgasgarth/opencode-for-rust/commit/93907e990739d66d3856535a240a9fdf968e559f))

## [1.0.7](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.6...v1.0.7) (2026-01-09)


### Bug Fixes

* force release for wasm migration ([787cb91](https://github.com/cgasgarth/opencode-for-rust/commit/787cb91b2dae7cd22ded026834f71a9b003a22aa))

## [1.0.6](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.5...v1.0.6) (2026-01-09)


### Bug Fixes

* **build:** externalize tree-sitter dependencies to fix native binary loading ([67eed3d](https://github.com/cgasgarth/opencode-for-rust/commit/67eed3d1f9857feb2da130482a4d01d08185650a))

## [1.0.5](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.4...v1.0.5) (2026-01-09)


### Bug Fixes

* **build:** run tree-sitter fix in postinstall instead of build ([d4c8773](https://github.com/cgasgarth/opencode-for-rust/commit/d4c87732269ab2a156de8b8a92dffd83073a4477))

## [1.0.4](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.3...v1.0.4) (2026-01-09)


### Bug Fixes

* **build:** update mise build task to include tree-sitter fix and types ([571b591](https://github.com/cgasgarth/opencode-for-rust/commit/571b591c2437d67d7983b3b175bebd6b0b9d3915))

## [1.0.3](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.2...v1.0.3) (2026-01-09)


### Bug Fixes

* **build:** bundle tree-sitter binary ([b35f16d](https://github.com/cgasgarth/opencode-for-rust/commit/b35f16df5785ff065d8b25c03fd57bdafef4343b))

## [1.0.2](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.1...v1.0.2) (2026-01-09)


### Bug Fixes

* downgrade tree-sitter to match peer dependency ([0e81d4a](https://github.com/cgasgarth/opencode-for-rust/commit/0e81d4af517b2feb5965ae61c87033684afdb877))

## [1.0.1](https://github.com/cgasgarth/opencode-for-rust/compare/v1.0.0...v1.0.1) (2026-01-08)


### Bug Fixes

* **build:** generate type definitions ([1b7ef87](https://github.com/cgasgarth/opencode-for-rust/commit/1b7ef875702485fd88cd080608b3597c9ef69782))

## 1.0.0 (2026-01-08)


### Features

* implement rust type injection plugin ([2f7e61a](https://github.com/cgasgarth/opencode-for-rust/commit/2f7e61a9e8d1d9812a5952193b7c2aa4463eedaf))


### Bug Fixes

* **ci:** add bun install step and publish task ([6a7c47b](https://github.com/cgasgarth/opencode-for-rust/commit/6a7c47be47bd853d772f5d31ec952b09cc2e6c15))
* **ci:** configure npm auth for publish ([f5af8ea](https://github.com/cgasgarth/opencode-for-rust/commit/f5af8ea8852eff515a7fa4eff54531f650e6e62d))
* resolve linting issues and remove comments ([8ab40ed](https://github.com/cgasgarth/opencode-for-rust/commit/8ab40ed55c6882dfdeca0ab93a7350cc7c83770d))
* update repository url to match owner for npm provenance ([b86fa6a](https://github.com/cgasgarth/opencode-for-rust/commit/b86fa6a5b762bdb22f0b404c1fa9a7e7cc223d2a))

## Changelog

All notable changes to this project will be documented here by Release Please.
