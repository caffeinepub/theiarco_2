// Centralized page theme color mapping
export const PAGE_THEME_COLORS = {
  '/': '#43587A',                          // Dashboard
  '/publishers': '#003057',                // Publishers (navy blue)
  '/pioneers': '#F4A82E',                  // Pioneers (gold)
  '/territories': '#5B8FA3',               // Territories (slate blue)
  '/shepherding': '#228B22',               // Shepherding (forest green)
  '/conductors': '#800020',                // Service Meeting Conductors (deep burgundy)
  '/public-witnessing': '#87CEEB',         // Public Witnessing (light blue)
  '/field-service-groups': '#20B2AA',      // Field Service Groups (cyan/teal)
  '/notes': '#A8A9AD',                     // Notes (gray)
  '/tasks': '#FFBF00',                     // Tasks (amber)
  '/user-profile': '#2C2C2C',              // User Profile (dark gray)
} as const;

export type PagePath = keyof typeof PAGE_THEME_COLORS;

/**
 * Get the theme color for a given page path
 */
export function getPageThemeColor(path: string): string {
  // Exact match first
  if (path in PAGE_THEME_COLORS) {
    return PAGE_THEME_COLORS[path as PagePath];
  }
  
  // Check if path starts with any of our routes (for nested routes)
  for (const [route, color] of Object.entries(PAGE_THEME_COLORS)) {
    if (route !== '/' && path.startsWith(route)) {
      return color;
    }
  }
  
  // Default fallback
  return PAGE_THEME_COLORS['/'];
}

/**
 * Get the theme color for the current route
 */
export function usePageThemeColor(currentPath: string): string {
  return getPageThemeColor(currentPath);
}
