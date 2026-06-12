# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-12

### Added

- Initial release of 2d-assets-mcp
- `generate_mock_asset` tool for single PNG asset generation
- `generate_mock_asset_batch` tool for batch asset and spritesheet generation
- `read_image_metadata` tool for reading embedded PNG metadata
- Support for gradients (linear and radial)
- Support for pattern overlays (stripes, dots, grid)
- Support for progress/health bar fills with `fillPercent`
- Auto-scaling text with rotation support
- Embedded JSON metadata in PNG EXIF data
- Spritesheet composition mode with configurable margin and spacing

## [0.1.1] - 2026-10-12

### Changed

Prepare release 0.1.1: update version across package.json, server.json, and server.ts; add a 0.1.1 entry in CHANGELOG.md. Add docs files to .prettierignore, tidy CONTRIBUTING.md and SECURITY.md content, and remove the long minimumReleaseAgeExclude list from pnpm-workspace.yaml. Apply small code/style tweaks: remove xmlns from generated SVG tag, format imports and signatures in utils, and minor ESLint config formatting fixes.
