import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import AddPublisherModal from '../components/publishers/AddPublisherModal';
import { useGetAllPublishers } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Publisher } from '../backend';

export default function Publishers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: publishers, isLoading } = useGetAllPublishers();

  // Format privileges for display
  const formatPrivileges = (privileges: Publisher['privileges']): string => {
    const roles: string[] = [];
    if (privileges.elder) roles.push('Elder');
    if (privileges.servant) roles.push('Servant');
    if (privileges.publisher) roles.push('Publisher');
    return roles.length > 0 ? roles.join(', ') : 'None';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Publishers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#43587A' }}
        >
          <Plus className="h-5 w-5" />
          Add Publisher
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading...</p>
        </div>
      ) : publishers && publishers.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p>No publishers found. Click 'Add Publisher' to get started.</p>
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
              {publishers?.map((publisher) => (
                <TableRow
                  key={publisher.id.toString()}
                  className={!publisher.isActive ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => e.preventDefault()}
                        className="text-foreground hover:underline font-medium"
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
                  <TableCell>{formatPrivileges(publisher.privileges)}</TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddPublisherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
