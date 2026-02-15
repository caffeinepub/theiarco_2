import { useState } from 'react';
import { Loader2, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetTasks } from '../hooks/useTasks';
import { useUpdateTaskCompletion } from '../hooks/useUpdateTaskCompletion';
import { useDeleteTask } from '../hooks/useDeleteTask';
import { formatTaskDate } from '../utils/formatters';
import { TaskStatus } from '../backend';
import type { Task } from '../backend';
import AddTaskModal from '../components/tasks/AddTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import { toast } from 'sonner';
import { buildTasksCsv, downloadCsv } from '../utils/tasksCsvExport';
import { useRouterState } from '@tanstack/react-router';
import { getPageThemeColor } from '@/theme/pageTheme';
import { getContrastColor } from '@/theme/colorUtils';
import { ThemedPrimaryButton } from '@/components/theming/ThemedPrimaryButton';
import { ThemedTableHeaderRow, ThemedTableHead } from '@/components/theming/ThemedTableHeaderRow';

type FilterType = 'all' | 'completed' | 'uncompleted';

export default function Tasks() {
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Map filter to backend TaskStatus enum
  const getTaskStatus = (filter: FilterType): TaskStatus => {
    switch (filter) {
      case 'all':
        return TaskStatus.all;
      case 'completed':
        return TaskStatus.completed;
      case 'uncompleted':
        return TaskStatus.uncompleted;
    }
  };

  const { data: tasks = [], isLoading, isFetching } = useGetTasks(getTaskStatus(activeFilter));
  // Fetch all tasks for export (ignoring current filter)
  const { data: allTasks = [] } = useGetTasks(TaskStatus.all);
  const updateCompletionMutation = useUpdateTaskCompletion();
  const deleteTaskMutation = useDeleteTask();

  const handleCheckboxChange = async (task: Task) => {
    try {
      await updateCompletionMutation.mutateAsync({
        id: task.id,
        isCompleted: !task.isCompleted,
      });
    } catch (error) {
      console.error('Failed to update task completion:', error);
    }
  };

  const handleAddTaskClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      toast.success('Task deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  const handleExportCsv = () => {
    try {
      const csvContent = buildTasksCsv(allTasks);
      downloadCsv(csvContent, 'tasks-export.csv');
      toast.success('Tasks exported successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to export tasks:', error);
      toast.error('Failed to export tasks. Please try again.');
    }
  };

  // Show loading state during initial load or refetch
  const showLoading = isLoading || isFetching;
  const headerTextColor = getContrastColor(themeColor);

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
          <ThemedPrimaryButton
            themeColor={themeColor}
            onClick={handleAddTaskClick}
          >
            Add Task
          </ThemedPrimaryButton>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          style={
            activeFilter === 'all'
              ? { backgroundColor: themeColor, color: getContrastColor(themeColor) }
              : undefined
          }
          className={
            activeFilter === 'all'
              ? 'hover:opacity-90 transition-opacity'
              : 'hover:bg-accent'
          }
          onClick={() => setActiveFilter('all')}
        >
          All Tasks
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          style={
            activeFilter === 'completed'
              ? { backgroundColor: themeColor, color: getContrastColor(themeColor) }
              : undefined
          }
          className={
            activeFilter === 'completed'
              ? 'hover:opacity-90 transition-opacity'
              : 'hover:bg-accent'
          }
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={activeFilter === 'uncompleted' ? 'default' : 'outline'}
          style={
            activeFilter === 'uncompleted'
              ? { backgroundColor: themeColor, color: getContrastColor(themeColor) }
              : undefined
          }
          className={
            activeFilter === 'uncompleted'
              ? 'hover:opacity-90 transition-opacity'
              : 'hover:bg-accent'
          }
          onClick={() => setActiveFilter('uncompleted')}
        >
          Uncompleted
        </Button>
      </div>

      {/* Tasks Table */}
      <div className="flex-1 border rounded-lg">
        {showLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">
              No tasks found. Click 'Add Task' to create your first task.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <ThemedTableHeaderRow themeColor={themeColor}>
                <ThemedTableHead themeColor={themeColor} className="w-[50px]">
                  <span className="sr-only">Checkbox</span>
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Title</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Due Date</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Category</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor} className="w-[180px]">Actions</ThemedTableHead>
              </ThemedTableHeaderRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <tr key={task.id.toString()}>
                  <TableCell>
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={() => handleCheckboxChange(task)}
                      disabled={updateCompletionMutation.isPending}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{formatTaskDate(task.dueDate)}</TableCell>
                  <TableCell>{task.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(task)}
                        className="h-8 gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(task)}
                        className="h-8 gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          task={selectedTask}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
