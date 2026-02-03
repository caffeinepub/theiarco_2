import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-theiarco-primary/10 p-6">
            <Construction className="h-12 w-12 text-theiarco-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-lg text-muted-foreground">
          Coming Soon
        </p>
        <p className="text-sm text-muted-foreground">
          This feature is currently under development and will be available in a future update.
        </p>
      </div>
    </div>
  );
}
