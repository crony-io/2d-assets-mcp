// ─── Primitive union types ────────────────────────────────────────────────────

export type Shape = 'rectangle' | 'rounded-rectangle' | 'circle';
export type TextPosition = 'center' | 'top' | 'bottom';
export type FillMode = 'solid' | 'linear-gradient' | 'radial-gradient';
export type Pattern = 'none' | 'stripes' | 'dots' | 'grid';
export type SpritesheetMode = 'individual' | 'spritesheet';

// ─── Low-level color types ────────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface GradientCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ─── Visual configuration (shared across single + batch assets) ───────────────

export interface VisualConfig {
  color: string;
  width: number;
  height: number;
  shape: Shape;
  opacity: number;
  fillPercent: number;
  trackColor?: string;
  textPosition: TextPosition;
  fontSize?: number;
  strokeColor: string;
  strokeWidth: number;
  textRotation: number;
  fillMode: FillMode;
  secondaryColor?: string;
  gradientAngle: number;
  pattern: Pattern;
  patternColor?: string;
  patternOpacity: number;
  patternScale: number;
}

// ─── Full asset configuration (adds file identity + text) ────────────────────

export interface AssetConfig extends VisualConfig {
  filename: string;
  directory: string;
  text: string;
  assetDescription?: string;
}

// ─── SVG build params (VisualConfig + text rendering, optional idPrefix) ──────

export interface SvgBuildParams extends VisualConfig {
  text: string;
  idPrefix?: string;
}

export interface FontSizeParams {
  text: string;
  width: number;
  height: number;
}

// ─── SVG internals ───────────────────────────────────────────────────────────

export interface FillDefsParams {
  idPrefix: string;
  color: string;
  secondaryColor?: string;
  fillMode: FillMode;
  gradientAngle: number;
  pattern: Pattern;
  patternColor?: string;
  patternOpacity: number;
  patternScale: number;
}

export interface FillDefsResult {
  defs: string;
  fillRef: string;
  hasPattern: boolean;
}

export interface ShapeMarkupParams {
  width: number;
  height: number;
  shape: Shape;
  fillRef: string;
  opacity: number;
  strokeColor: string;
  strokeWidth: number;
  idPrefix: string;
  hasPattern: boolean;
  trackColor?: string;
  clipAttr: string;
}

export interface ShapeMarkupResult {
  trackShape: string;
  baseShape: string;
  overlayShape: string;
  strokeShape: string;
}

// ─── Spritesheet ─────────────────────────────────────────────────────────────

export interface SpritesheetParams {
  assets: AssetConfig[];
  directory: string;
  filename: string;
  margin?: number;
  spacing?: number;
  sheetMeta?: Record<string, string | number | boolean | null>;
}

// ─── PNG metadata (embedded as EXIF ImageDescription JSON) ───────────────────

export interface AssetMetadata {
  generator: string;
  type: string;
  createdAt: string;
  // asset-specific optional fields
  name?: string;
  width?: number;
  height?: number;
  color?: string;
  shape?: string;
  fillMode?: string;
  fillPercent?: number;
  trackColor?: string | null;
  pattern?: string;
  description?: string | null;
  // spritesheet-specific optional fields
  totalWidth?: number;
  totalHeight?: number;
  columns?: number;
  rows?: number;
  frameCount?: number;
  frameWidth?: number;
  frameHeight?: number;
  margin?: number;
  spacing?: number;
  // Allow additional arbitrary properties
  [key: string]: string | number | boolean | null | undefined;
}
