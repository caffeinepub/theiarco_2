/**
 * Utility helper that returns Tailwind className overrides for privilege badges.
 * Maps "Elder" to Amethyst Purple (#7C3AED) and "Ministerial Servant" to Sapphire Blue (#2563EB).
 */
export function getPrivilegeBadgeClassName(privilege: 'Elder' | 'Ministerial Servant'): string {
  if (privilege === 'Elder') {
    return 'bg-[#7C3AED] text-white hover:bg-[#7C3AED]';
  }
  if (privilege === 'Ministerial Servant') {
    return 'bg-[#2563EB] text-white hover:bg-[#2563EB]';
  }
  return '';
}
