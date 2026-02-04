import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import ComingSoon from './pages/ComingSoon';
import Publishers from './pages/Publishers';
import PublisherProfile from './pages/PublisherProfile';
import Notes from './pages/Notes';

// Root component that handles auth state
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
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

const publisherProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publishers/$id',
  component: PublisherProfile
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
  component: Notes
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
  publisherProfileRoute,
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
