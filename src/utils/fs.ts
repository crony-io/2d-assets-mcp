import fs from 'fs';

/**
 * Creates the directory (and any missing parents) if it does not already exist.
 * Synchronous — keeps asset creation code simple and sequential.
 */
export function ensureDirectory(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
