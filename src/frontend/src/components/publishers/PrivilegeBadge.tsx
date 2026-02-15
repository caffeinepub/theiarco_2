import { Badge } from '@/components/ui/badge';

interface PrivilegeBadgeProps {
  privilege: 'Elder' | 'Ministerial Servant';
}

export default function PrivilegeBadge({ privilege }: PrivilegeBadgeProps) {
  // Use exact colors specified by user with no dark mode variants
  const backgroundColor = privilege === 'Elder' ? '#7C3AED' : '#2563EB';

  return (
    <Badge
      className="text-white font-medium hover:opacity-100"
      style={{
        backgroundColor,
      }}
    >
      {privilege}
    </Badge>
  );
}
