/**
 * Parse a hex color string to RGB components
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get contrasting text color (black or white) for a given background color
 */
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#FFFFFF'; // Default to white if parsing fails

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // WCAG recommends 0.5 as threshold, but 0.6 works better for our palette
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Lighten a hex color by a percentage (for hover states)
 */
export function lightenColor(hex: string, percent: number = 15): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const lighten = (value: number) => {
    const increased = value + (255 - value) * (percent / 100);
    return Math.min(255, Math.round(increased));
  };

  const r = lighten(rgb.r).toString(16).padStart(2, '0');
  const g = lighten(rgb.g).toString(16).padStart(2, '0');
  const b = lighten(rgb.b).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}
