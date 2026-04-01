import { ThemedPrimaryButton } from "@/components/theming/ThemedPrimaryButton";
import {
  ThemedTableHead,
  ThemedTableHeaderRow,
} from "@/components/theming/ThemedTableHeaderRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { getPageThemeColor } from "@/theme/pageTheme";
import { useRouterState } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { TrainedPublisher } from "../backend";
import DeleteTrainedPublisherDialog from "../components/publicWitnessing/DeleteTrainedPublisherDialog";
import TrainedPublisherModal from "../components/publicWitnessing/TrainedPublisherModal";
import { useGetAllTrainedPublishers } from "../hooks/useTrainedPublishers";
import { formatTrainingDate } from "../utils/formatters";

export default function PublicWitnessing() {
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] =
    useState<TrainedPublisher | null>(null);
  const [deletingPublisherId, setDeletingPublisherId] = useState<string | null>(
    null,
  );

  const { data: trainedPublishers = [], isLoading } =
    useGetAllTrainedPublishers();

  // Sort alphabetically by publisher name
  const sortedPublishers = useMemo(() => {
    return [...trainedPublishers].sort((a, b) =>
      a.publisherName.localeCompare(b.publisherName),
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
        <h1 className="text-3xl font-bold text-foreground">
          Public Witnessing
        </h1>
        <ThemedPrimaryButton
          themeColor={themeColor}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Trained Publisher
        </ThemedPrimaryButton>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : sortedPublishers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No trained publishers yet. Click "Add Trained Publisher" to get
          started.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <ThemedTableHeaderRow themeColor={themeColor}>
                <ThemedTableHead themeColor={themeColor}>
                  Publisher Name
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  Training Date
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  Authorization Status
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  S-148 Form
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor} className="text-right">
                  Actions
                </ThemedTableHead>
              </ThemedTableHeaderRow>
            </TableHeader>
            <TableBody>
              {sortedPublishers.map((publisher) => (
                <tr key={publisher.id}>
                  <TableCell className="font-medium">
                    {publisher.publisherName}
                  </TableCell>
                  <TableCell>
                    {formatTrainingDate(publisher.trainingDate)}
                  </TableCell>
                  <TableCell>
                    {publisher.isAuthorized ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        Authorized
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {publisher.hasS148Received ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        Received
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-400 hover:bg-gray-500 text-white"
                      >
                        Not Received
                      </Badge>
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
                </tr>
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
