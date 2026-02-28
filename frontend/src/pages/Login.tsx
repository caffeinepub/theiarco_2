import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo/Title Section */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Theiarco
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Service Overseer Assistant
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-lg space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Authenticate to access your congregation data across all devices
            </p>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full bg-theiarco-primary hover:bg-theiarco-primary/90 text-white font-semibold"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-muted-foreground">
          Secure authentication powered by Internet Computer
        </p>
      </div>
    </div>
  );
}
