import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import Login from './pages/Login';
import AppLayout from './components/layout/AppLayout';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import Publishers from './pages/Publishers';
import PublisherProfile from './pages/PublisherProfile';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Territories from './pages/Territories';
import TerritoryProfile from './pages/TerritoryProfile';
import Pioneers from './pages/Pioneers';
import Shepherding from './pages/Shepherding';
import ShepherdingVisitProfile from './pages/ShepherdingVisitProfile';
import ServiceMeetingConductors from './pages/ServiceMeetingConductors';
import PublicWitnessing from './pages/PublicWitnessing';
import FieldServiceGroups from './pages/FieldServiceGroups';
import FieldServiceGroupProfile from './pages/FieldServiceGroupProfile';
import UserProfile from './pages/UserProfile';

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

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard
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
  component: Pioneers
});

const territoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/territories',
  component: Territories
});

const territoryProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/territories/$id',
  component: TerritoryProfile
});

const shepherdingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shepherding',
  component: Shepherding
});

const shepherdingVisitProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shepherding/$id',
  component: ShepherdingVisitProfile
});

const conductorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conductors',
  component: ServiceMeetingConductors
});

const publicWitnessingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/public-witnessing',
  component: PublicWitnessing
});

const fieldServiceGroupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/field-service-groups',
  component: FieldServiceGroups
});

const fieldServiceGroupProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/field-service-groups/$groupNumber',
  component: FieldServiceGroupProfile
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: Notes
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: Tasks
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-profile',
  component: UserProfile
});

// Create route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  publishersRoute,
  publisherProfileRoute,
  pioneersRoute,
  territoriesRoute,
  territoryProfileRoute,
  shepherdingRoute,
  shepherdingVisitProfileRoute,
  conductorsRoute,
  publicWitnessingRoute,
  fieldServiceGroupsRoute,
  fieldServiceGroupProfileRoute,
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
