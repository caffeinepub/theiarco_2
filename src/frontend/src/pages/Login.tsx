import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-2">
            Theiarco
          </h1>
          <p className="text-lg text-muted-foreground">
            Congregation Management System
          </p>
        </div>

        {/* Login Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
          </Button>
        </div>
      </div>
    </div>
  );
}
