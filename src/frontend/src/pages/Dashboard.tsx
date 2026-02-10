import { useGetAllPublishers } from '../hooks/useQueries';
import { useGetAllTerritories } from '../hooks/useTerritories';
import { useGetTasks } from '../hooks/useTasks';
import { useGetAllShepherdingVisits } from '../hooks/useShepherdingVisits';
import { TaskStatus } from '../backend';
import { Users, Map, Clock, AlertCircle } from 'lucide-react';
import { formatVisitDate } from '../utils/formatters';
import { Link } from '@tanstack/react-router';

export default function Dashboard() {
  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const { data: territories = [], isLoading: territoriesLoading } = useGetAllTerritories();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks(TaskStatus.all);
  const { data: shepherdingVisits = [], isLoading: visitsLoading } = useGetAllShepherdingVisits();

  // Calculate current timestamp in seconds
  const nowSeconds = Math.floor(Date.now() / 1000);

  // Calculate stats
  const activePublishersCount = publishers.filter(p => p.isActive).length;
  const checkedOutTerritoriesCount = territories.filter(t => t.status === 'Checked Out').length;
  
  // Upcoming tasks: not completed and dueDate is in the future
  const upcomingTasksCount = tasks.filter(task => {
    if (task.isCompleted) return false;
    const dueDate = typeof task.dueDate === 'bigint' ? Number(task.dueDate) : task.dueDate;
    return dueDate > nowSeconds;
  }).length;

  // Overdue tasks: not completed and dueDate has passed
  const overdueTasksCount = tasks.filter(task => {
    if (task.isCompleted) return false;
    const dueDate = typeof task.dueDate === 'bigint' ? Number(task.dueDate) : task.dueDate;
    return dueDate < nowSeconds;
  }).length;

  // Get 5 most recent shepherding visits sorted by date (newest first)
  const recentVisits = [...shepherdingVisits]
    .sort((a, b) => {
      const dateA = typeof a.visitDate === 'bigint' ? Number(a.visitDate) : a.visitDate;
      const dateB = typeof b.visitDate === 'bigint' ? Number(b.visitDate) : b.visitDate;
      return dateB - dateA;
    })
    .slice(0, 5);

  const isLoading = publishersLoading || territoriesLoading || tasksLoading || visitsLoading;

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your congregation's activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Publishers Card */}
        <div className="rounded-lg bg-green-500 p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{activePublishersCount}</p>
            <p className="text-lg font-medium opacity-90">Active Publishers</p>
          </div>
        </div>

        {/* Checked Out Territories Card */}
        <div className="rounded-lg bg-blue-500 p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <Map className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{checkedOutTerritoriesCount}</p>
            <p className="text-lg font-medium opacity-90">Checked Out Territories</p>
          </div>
        </div>

        {/* Upcoming Tasks Card */}
        <div className="rounded-lg bg-orange-500 p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{upcomingTasksCount}</p>
            <p className="text-lg font-medium opacity-90">Upcoming Tasks</p>
          </div>
        </div>

        {/* Overdue Tasks Card */}
        <div className="rounded-lg bg-red-500 p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="h-8 w-8 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-bold">{overdueTasksCount}</p>
            <p className="text-lg font-medium opacity-90">Overdue Tasks</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
        {recentVisits.length === 0 ? (
          <p className="text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
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
    </div>
  );
}
