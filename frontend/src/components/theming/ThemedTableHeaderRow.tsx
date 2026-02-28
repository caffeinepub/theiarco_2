import { TableHead, TableRow } from '@/components/ui/table';
import { getContrastColor } from '@/theme/colorUtils';
import type { ReactNode } from 'react';

interface ThemedTableHeaderRowProps {
  themeColor: string;
  children: ReactNode;
}

/**
 * Table header row with themed background and auto-contrast text
 */
export function ThemedTableHeaderRow({ themeColor, children }: ThemedTableHeaderRowProps) {
  const textColor = getContrastColor(themeColor);

  return (
    <TableRow
      style={{
        backgroundColor: themeColor,
        color: textColor,
      }}
      className="hover:opacity-95"
    >
      {children}
    </TableRow>
  );
}

interface ThemedTableHeadProps {
  themeColor: string;
  children: ReactNode;
  className?: string;
}

/**
 * Table header cell with themed text color
 */
export function ThemedTableHead({ themeColor, children, className }: ThemedTableHeadProps) {
  const textColor = getContrastColor(themeColor);

  return (
    <TableHead
      style={{ color: textColor }}
      className={className}
    >
      {children}
    </TableHead>
  );
}
