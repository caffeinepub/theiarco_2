import { useGetAllPublishers } from '../hooks/useQueries';
import { useGetAllTerritories } from '../hooks/useTerritories';
import { useGetTasks } from '../hooks/useTasks';
import { useGetAllShepherdingVisits } from '../hooks/useShepherdingVisits';
import { usePioneersOnTrack } from '../hooks/usePioneersOnTrack';
import { TaskStatus, Territory, CheckoutRecord } from '../backend';
import { Users, Map, ListTodo, AlertCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatVisitDate } from '../utils/formatters';
import { getCurrentServiceYear } from '../utils/serviceYear';
import { Link } from '@tanstack/react-router';

export default function Dashboard() {
  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const { data: territories = [], isLoading: territoriesLoading } = useGetAllTerritories();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks(TaskStatus.all);
  const { data: shepherdingVisits = [], isLoading: visitsLoading } = useGetAllShepherdingVisits();
  
  // Get current service year and pioneers on track count
  const currentServiceYear = getCurrentServiceYear();
  const { data: pioneersOnTrackCount = 0, isLoading: pioneersOnTrackLoading } = usePioneersOnTrack(currentServiceYear);

  // Calculate current timestamp in seconds
  const nowSeconds = Math.floor(Date.now() / 1000);

  // Calculate stats
  const activePublishersCount = publishers.filter(p => p.isActive).length;
  const checkedOutTerritoriesCount = territories.filter(t => t.status === 'Checked Out').length;
  
  // Uncompleted tasks: all tasks where isCompleted = false
  const uncompletedTasksCount = tasks.filter(task => !task.isCompleted).length;

  // Overdue tasks: not completed and dueDate has passed (still needed for Alerts section)
  const overdueTasksCount = tasks.filter(task => {
    if (task.isCompleted) return false;
    const dueDate = typeof task.dueDate === 'bigint' ? Number(task.dueDate) : task.dueDate;
    return dueDate < nowSeconds;
  }).length;

  // Helper to get the active checkout record (most recent with dateReturned = null)
  const getActiveCheckoutRecord = (territory: Territory): CheckoutRecord | null => {
    const activeRecords = territory.checkOutHistory.filter(
      (record) => record.dateReturned === undefined || record.dateReturned === null
    );

    if (activeRecords.length === 0) return null;

    // Return the record with the largest dateCheckedOut
    return activeRecords.reduce((latest, current) => {
      return Number(current.dateCheckedOut) > Number(latest.dateCheckedOut) ? current : latest;
    });
  };

  // Helper to calculate checked out duration in months
  const getCheckedOutDuration = (territory: Territory): number | null => {
    if (territory.status !== 'Checked Out') {
      return null;
    }

    const activeRecord = getActiveCheckoutRecord(territory);
    if (!activeRecord) {
      return null;
    }

    const currentTimestampSeconds = Math.floor(Date.now() / 1000);
    const dateCheckedOutSeconds = Number(activeRecord.dateCheckedOut);
    const months = Math.floor((currentTimestampSeconds - dateCheckedOutSeconds) / (30 * 24 * 60 * 60));

    return months;
  };

  // Calculate overdue territories (checked out for 4+ months)
  const overdueTerritoriesCount = territories.filter(territory => {
    const duration = getCheckedOutDuration(territory);
    return duration !== null && duration >= 4;
  }).length;

  // Get 5 most recent shepherding visits sorted by date (newest first)
  const recentVisits = [...shepherdingVisits]
    .sort((a, b) => {
      const dateA = typeof a.visitDate === 'bigint' ? Number(a.visitDate) : a.visitDate;
      const dateB = typeof b.visitDate === 'bigint' ? Number(b.visitDate) : b.visitDate;
      return dateB - dateA;
    })
    .slice(0, 5);

  const isLoading = publishersLoading || territoriesLoading || tasksLoading || visitsLoading || pioneersOnTrackLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your congregation's activities</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Publishers Card */}
        <Link
          to="/publishers"
          className="block rounded-lg bg-dashboard-stat-1 p-6 text-white shadow-md transition-all hover:shadow-xl hover:brightness-110 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{activePublishersCount}</p>
            <p className="text-lg font-medium opacity-90">Active Publishers</p>
          </div>
        </Link>

        {/* Checked Out Territories Card */}
        <Link
          to="/territories"
          className="block rounded-lg bg-dashboard-stat-2 p-6 text-white shadow-md transition-all hover:shadow-xl hover:brightness-110 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <Map className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{checkedOutTerritoriesCount}</p>
            <p className="text-lg font-medium opacity-90">Checked Out Territories</p>
          </div>
        </Link>

        {/* Uncompleted Tasks Card */}
        <Link
          to="/tasks"
          className="block rounded-lg bg-dashboard-stat-uncompleted p-6 text-white shadow-md transition-all hover:shadow-xl hover:brightness-110 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <ListTodo className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{uncompletedTasksCount}</p>
            <p className="text-lg font-medium opacity-90">Uncompleted Tasks</p>
          </div>
        </Link>

        {/* Pioneers On Track Card */}
        <Link
          to="/pioneers"
          className="block rounded-lg bg-dashboard-stat-green p-6 text-white shadow-md transition-all hover:shadow-xl hover:brightness-110 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{pioneersOnTrackCount}</p>
            <p className="text-lg font-medium opacity-90">Pioneers On Track</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
        {recentVisits.length === 0 ? (
          <p className="text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{visit.publisherName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatVisitDate(visit.visitDate)}
                  </p>
                </div>
                <Link
                  to="/shepherding/$id"
                  params={{ id: visit.id }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Alerts</h2>
        {overdueTerritoriesCount === 0 && overdueTasksCount === 0 ? (
          <p className="text-muted-foreground">No alerts</p>
        ) : (
          <div className="space-y-3">
            {/* Overdue Territories Alert */}
            {overdueTerritoriesCount > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 p-4 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="font-medium text-red-900">
                    {overdueTerritoriesCount} {overdueTerritoriesCount === 1 ? 'territory' : 'territories'} overdue for return
                  </p>
                </div>
                <Link
                  to="/territories"
                  className="text-sm font-medium text-red-700 hover:underline whitespace-nowrap"
                >
                  View Territories
                </Link>
              </div>
            )}

            {/* Overdue Tasks Alert */}
            {overdueTasksCount > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-orange-300 bg-orange-50 p-4 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <p className="font-medium text-orange-900">
                    {overdueTasksCount} overdue {overdueTasksCount === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                <Link
                  to="/tasks"
                  className="text-sm font-medium text-orange-700 hover:underline whitespace-nowrap"
                >
                  View Tasks
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
