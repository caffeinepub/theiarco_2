import { useState, useMemo } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import AddPublisherModal from '../components/publishers/AddPublisherModal';
import EditPublisherModal from '../components/publishers/EditPublisherModal';
import { useGetAllPublishers } from '../hooks/useQueries';
import { useDeletePublisher } from '../hooks/useDeletePublisher';
import type { Publisher } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Publishers() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  
  const { data: publishers, isLoading } = useGetAllPublishers();
  const deletePublisher = useDeletePublisher();

  // Filter publishers based on all three criteria
  const filteredPublishers = useMemo(() => {
    if (!publishers) return [];

    return publishers.filter((publisher) => {
      // Search filter: case-insensitive substring match on fullName
      const matchesSearch = publisher.fullName
        .toLowerCase()
        .includes(searchText.toLowerCase());

      // Group filter: match specific group or show all
      const matchesGroup =
        selectedGroup === 'all' ||
        publisher.fieldServiceGroup.toString() === selectedGroup;

      // Active status filter: hide inactive unless showInactive is true
      const matchesActiveStatus = showInactive || publisher.isActive;

      // All filters must match (AND logic)
      return matchesSearch && matchesGroup && matchesActiveStatus;
    });
  }, [publishers, searchText, selectedGroup, showInactive]);

  // Helper function to render privilege labels
  const renderPrivileges = (privileges: {
    publisher: boolean;
    servant: boolean;
    elder: boolean;
  }) => {
    const labels: string[] = [];
    if (privileges.elder) labels.push('Elder');
    if (privileges.servant) labels.push('Ministerial Servant');
    if (privileges.publisher) labels.push('Publisher');
    if (labels.length === 0) labels.push('Unbaptized Publisher');
    return labels.join(', ');
  };

  const handleEditClick = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedPublisher(null);
  };

  const handleDeleteClick = (publisher: Publisher) => {
    setPublisherToDelete(publisher);
  };

  const handleDeleteConfirm = async () => {
    if (!publisherToDelete) return;

    try {
      await deletePublisher.mutateAsync(publisherToDelete.id);
      toast.success('Publisher deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      // Error toast is handled in the mutation hook
    } finally {
      setPublisherToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setPublisherToDelete(null);
  };

  const handleNameClick = (publisherId: bigint) => {
    navigate({ to: `/publishers/${publisherId.toString()}` });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Publishers</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#43587A' }}
        >
          <Plus className="h-5 w-5" />
          Add Publisher
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 p-4 rounded-lg border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Group Filter Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="group-filter">Filter by Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger id="group-filter" className="w-full">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="1">Group 1</SelectItem>
                <SelectItem value="2">Group 2</SelectItem>
                <SelectItem value="3">Group 3</SelectItem>
                <SelectItem value="4">Group 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Inactive Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={(checked) => setShowInactive(checked === true)}
            />
            <Label
              htmlFor="show-inactive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show Inactive Publishers
            </Label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      ) : filteredPublishers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {publishers && publishers.length === 0
            ? "No publishers found. Click 'Add Publisher' to get started."
            : 'No publishers match the current filters.'}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Privileges</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublishers.map((publisher) => (
                <TableRow
                  key={publisher.id.toString()}
                  className={!publisher.isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-primary hover:underline font-medium"
                        onClick={() => handleNameClick(publisher.id)}
                      >
                        {publisher.fullName}
                      </button>
                      {publisher.isGroupOverseer && (
                        <Badge variant="secondary" className="text-xs">
                          Overseer
                        </Badge>
                      )}
                      {publisher.isGroupAssistant && (
                        <Badge variant="secondary" className="text-xs">
                          Assistant
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{publisher.fieldServiceGroup.toString()}</TableCell>
                  <TableCell>{renderPrivileges(publisher.privileges)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(publisher)}
                        className="h-8 gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(publisher)}
                        className="h-8 gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddPublisherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {selectedPublisher && (
        <EditPublisherModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          publisher={selectedPublisher}
        />
      )}

      <AlertDialog open={!!publisherToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Publisher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this publisher?
            </AlertDialogDescription>
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
