/**
 * Escapes special XML/SVG characters in a value so it is safe to embed
 * inside SVG text elements or attribute values.
 */
export function escapeXml(
  value: string | number | boolean | null | undefined,
): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts an arbitrary string into a filesystem-safe lowercase base name
 * (no extension, no special characters). Falls back to 'asset' if empty.
 */
export function sanitizeFileBaseName(name: string): string {
  return (
    String(name)
      .trim()
      .replace(/\.[^/.]+$/, '') // strip extension if present
      .replace(/[^a-z0-9_-]+/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase() || 'asset'
  );
}
