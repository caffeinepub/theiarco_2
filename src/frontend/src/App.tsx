import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import ComingSoon from './pages/ComingSoon';
import Publishers from './pages/Publishers';
import { AlertCircle } from 'lucide-react';

// Root component that handles auth state
function RootComponent() {
  const { identity, isInitializing, loginError, isLoginError } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication initialization failed
  if (isLoginError && loginError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Authentication Error</h1>
          <p className="text-muted-foreground">{loginError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show authenticated app layout
  return <AppLayout />;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent
});

// Protected routes - all render ComingSoon with different titles
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <ComingSoon title="Dashboard" />
});

const publishersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publishers',
  component: Publishers
});

const pioneersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pioneers',
  component: () => <ComingSoon title="Pioneers" />
});

const territoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/territories',
  component: () => <ComingSoon title="Territories" />
});

const shepherdingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shepherding',
  component: () => <ComingSoon title="Shepherding" />
});

const conductorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conductors',
  component: () => <ComingSoon title="Service Meeting Conductors" />
});

const publicWitnessingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/public-witnessing',
  component: () => <ComingSoon title="Public Witnessing" />
});

const fieldServiceGroupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/field-service-groups',
  component: () => <ComingSoon title="Field Service Groups" />
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: () => <ComingSoon title="Notes" />
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: () => <ComingSoon title="Tasks" />
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-profile',
  component: () => <ComingSoon title="User Profile" />
});

// Create route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  publishersRoute,
  pioneersRoute,
  territoriesRoute,
  shepherdingRoute,
  conductorsRoute,
  publicWitnessingRoute,
  fieldServiceGroupsRoute,
  notesRoute,
  tasksRoute,
  userProfileRoute
]);

// Create router
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
