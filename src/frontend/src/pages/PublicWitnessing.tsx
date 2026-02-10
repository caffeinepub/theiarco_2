import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { useGetAllTrainedPublishers } from '../hooks/useTrainedPublishers';
import TrainedPublisherModal from '../components/publicWitnessing/TrainedPublisherModal';
import DeleteTrainedPublisherDialog from '../components/publicWitnessing/DeleteTrainedPublisherDialog';
import { formatTrainingDate } from '../utils/formatters';
import type { TrainedPublisher } from '../backend';

export default function PublicWitnessing() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<TrainedPublisher | null>(null);
  const [deletingPublisherId, setDeletingPublisherId] = useState<string | null>(null);

  const { data: trainedPublishers = [], isLoading } = useGetAllTrainedPublishers();

  // Sort alphabetically by publisher name
  const sortedPublishers = useMemo(() => {
    return [...trainedPublishers].sort((a, b) => 
      a.publisherName.localeCompare(b.publisherName)
    );
  }, [trainedPublishers]);

  const handleEdit = (publisher: TrainedPublisher) => {
    setEditingPublisher(publisher);
  };

  const handleDelete = (id: string) => {
    setDeletingPublisherId(id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Public Witnessing</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          style={{ backgroundColor: '#43587A', color: 'white' }}
          className="hover:opacity-90"
        >
          Add Trained Publisher
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : sortedPublishers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No trained publishers yet. Click "Add Trained Publisher" to get started.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher Name</TableHead>
                <TableHead>Training Date</TableHead>
                <TableHead>Authorization Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPublishers.map((publisher) => (
                <TableRow key={publisher.id}>
                  <TableCell className="font-medium">{publisher.publisherName}</TableCell>
                  <TableCell>{formatTrainingDate(publisher.trainingDate)}</TableCell>
                  <TableCell>
                    {publisher.isAuthorized ? (
                      <Badge className="bg-green-600 hover:bg-green-700">Authorized</Badge>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(publisher)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(publisher.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Modal */}
      <TrainedPublisherModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      {/* Edit Modal */}
      {editingPublisher && (
        <TrainedPublisherModal
          open={!!editingPublisher}
          onOpenChange={(open) => !open && setEditingPublisher(null)}
          publisher={editingPublisher}
        />
      )}

      {/* Delete Dialog */}
      {deletingPublisherId && (
        <DeleteTrainedPublisherDialog
          open={!!deletingPublisherId}
          onOpenChange={(open) => !open && setDeletingPublisherId(null)}
          publisherId={deletingPublisherId}
        />
      )}
    </div>
  );
}
