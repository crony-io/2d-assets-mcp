# Contributing to 2d-assets-mcp

Thank you for your interest in contributing to 2d-assets-mcp! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and constructive in all interactions
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later, pnpm 8 or later, or yarn (any package manager works)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/crony-io/2d-assets-mcp.git
   cd 2d-assets-mcp
   ```
3. Install dependencies:
   ```bash
   pnpm install   # recommended
   # or
   npm install
   # or
   yarn install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Project

- **Development mode** (no build needed):
  ```bash
  pnpm run dev
  # or
  npm run dev
  ```

- **Build the project**:
  ```bash
  pnpm run build
  # or
  npm run build
  ```

- **Run the built server**:
  ```bash
  pnpm run start
  # or
  npm run start
  ```

### Code Quality Checks

Before submitting a PR, run all checks:

```bash
pnpm run check
# or
npm run check
```

This runs:
- Format check (`prettier`)
- Linting (`eslint`)
- Type checking (`tsc`)

All checks must pass with zero errors.

### Adding a New Tool

1. Create a new file in `src/tools/` (e.g., `src/tools/yourTool.ts`)
2. Export a `registerYourTool(server: McpServer)` function
3. Import and call the register function in `src/server.ts`
4. Add any new Zod schemas to `src/schemas.ts`
5. Add any new types to `src/types.ts`
6. Update the README's **Tools Reference** section with the new tool's parameters

### Code Style

- Use TypeScript for all new code
- Follow existing code structure and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add support for circular shapes`
- `fix: correct spritesheet margin calculation`
- `docs: update installation instructions`
- `refactor: simplify color utility functions`

### Pull Request Process

1. Update the README if you change the API or add new features
2. Update the CHANGELOG.md with your changes
3. Ensure all checks pass (`pnpm run check`)
4. Push your branch and create a pull request
5. Describe your changes in the PR description
6. Link any related issues

### PR Review Process

- All PRs require review before merging
- Address reviewer feedback promptly
- Keep PRs focused and reasonably sized
- Add tests for new features when applicable

## Testing

### Manual Testing

Test your changes with Claude Desktop or other MCP clients:
1. Build the project: `pnpm run build`
2. Configure your MCP client to use the built `dist/index.js`
3. Test the new or modified tools
4. Verify edge cases and error handling

### Test Assets

Generated test assets can be placed in `test_assets_mcp/` for verification.

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues and discussions first
- Be patient with responses - maintainers volunteer their time

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
