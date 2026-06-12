# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |
| < 0.1.0 | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do not** create a public issue for security vulnerabilities
2. Send an email to the project maintainer with details about the vulnerability
3. Include steps to reproduce the vulnerability if possible
4. Allow time for the maintainer to assess and fix the issue before disclosure

### What to Include

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations

### Response Timeline

- You will receive an acknowledgment within 48 hours
- We will assess the severity and determine a fix timeline
- We will aim to release a patch within a reasonable timeframe based on severity
- We will coordinate with you on public disclosure timing

### Security Best Practices

- Keep dependencies updated by running `pnpm audit` regularly
- Review the code before using in production environments
- Only grant necessary file system permissions to the MCP server
- Be cautious when generating assets from untrusted input

## Security Scope

This project is an MCP server that generates PNG images and writes them to disk. Key security considerations:

- **File System Access**: The server requires write access to specified directories
- **Input Validation**: All parameters are validated using Zod schemas
- **No Remote Execution**: The server does not execute external commands or make network requests
- **No User Data Collection**: The server does not collect or transmit user data

## Dependency Security

This project uses the following main dependencies:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `sharp` - Image processing library
- `zod` - Schema validation

We regularly update dependencies to address security vulnerabilities. Users are encouraged to:
- Run `pnpm audit` to check for known vulnerabilities
- Keep Node.js updated to the latest LTS version
