import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/layout/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ConductorProfile from "./pages/ConductorProfile";
import Dashboard from "./pages/Dashboard";
import FieldServiceGroupProfile from "./pages/FieldServiceGroupProfile";
import FieldServiceGroups from "./pages/FieldServiceGroups";
import GroupVisitProfile from "./pages/GroupVisitProfile";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import PioneerProfile from "./pages/PioneerProfile";
import Pioneers from "./pages/Pioneers";
import PublicWitnessing from "./pages/PublicWitnessing";
import PublisherProfile from "./pages/PublisherProfile";
import Publishers from "./pages/Publishers";
import ServiceMeetingConductors from "./pages/ServiceMeetingConductors";
import Shepherding from "./pages/Shepherding";
import ShepherdingVisitProfile from "./pages/ShepherdingVisitProfile";
import Tasks from "./pages/Tasks";
import Territories from "./pages/Territories";
import TerritoryProfile from "./pages/TerritoryProfile";
import UserProfile from "./pages/UserProfile";

// Root component that handles auth state
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
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
  component: RootComponent,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const publishersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publishers",
  component: Publishers,
});

const publisherProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publishers/$id",
  component: PublisherProfile,
});

const pioneersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pioneers",
  component: Pioneers,
});

const pioneerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pioneers/$id",
  component: PioneerProfile,
});

const territoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/territories",
  component: Territories,
});

const territoryProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/territories/$id",
  component: TerritoryProfile,
});

const shepherdingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shepherding",
  component: Shepherding,
});

const shepherdingVisitProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shepherding/$id",
  component: ShepherdingVisitProfile,
});

const serviceMeetingConductorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conductors",
  component: ServiceMeetingConductors,
});

const conductorProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conductors/$id",
  component: ConductorProfile,
});

const publicWitnessingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/public-witnessing",
  component: PublicWitnessing,
});

const fieldServiceGroupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/field-service-groups",
  component: FieldServiceGroups,
});

const fieldServiceGroupProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/field-service-groups/$groupNumber",
  component: FieldServiceGroupProfile,
});

const groupVisitProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/field-service-groups/$groupNumber/visits/$visitId",
  component: GroupVisitProfile,
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notes",
  component: Notes,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: Tasks,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user-profile",
  component: UserProfile,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  publishersRoute,
  publisherProfileRoute,
  pioneersRoute,
  pioneerProfileRoute,
  territoriesRoute,
  territoryProfileRoute,
  shepherdingRoute,
  shepherdingVisitProfileRoute,
  serviceMeetingConductorsRoute,
  conductorProfileRoute,
  publicWitnessingRoute,
  fieldServiceGroupsRoute,
  fieldServiceGroupProfileRoute,
  groupVisitProfileRoute,
  notesRoute,
  tasksRoute,
  userProfileRoute,
]);

// Create the router
const router = createRouter({ routeTree });

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
