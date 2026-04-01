import { ThemedPrimaryButton } from "@/components/theming/ThemedPrimaryButton";
import {
  ThemedTableHead,
  ThemedTableHeaderRow,
} from "@/components/theming/ThemedTableHeaderRow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { getPageThemeColor } from "@/theme/pageTheme";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Pioneer } from "../backend";
import AddPioneerModal from "../components/pioneers/AddPioneerModal";
import DeletePioneerDialog from "../components/pioneers/DeletePioneerDialog";
import EditPioneerModal from "../components/pioneers/EditPioneerModal";
import PioneerTableRow from "../components/pioneers/PioneerTableRow";
import { useActor } from "../hooks/useActor";
import { useGetAllPioneers } from "../hooks/usePioneers";
import { useGetAllPublishers } from "../hooks/useQueries";
import { buildPioneersCsv, downloadCsv } from "../utils/pioneersCsvExport";
import { exportPioneersToPdf } from "../utils/pioneersPdfExport";

export default function Pioneers() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);

  const { actor } = useActor();
  const { data: pioneers, isLoading } = useGetAllPioneers();
  const { data: publishers = [], isLoading: publishersLoading } =
    useGetAllPublishers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPioneer, setSelectedPioneer] = useState<Pioneer | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleEditPioneer = (pioneer: Pioneer) => {
    setSelectedPioneer(pioneer);
    setIsEditModalOpen(true);
  };

  const handleDeletePioneer = (pioneer: Pioneer) => {
    setSelectedPioneer(pioneer);
    setIsDeleteDialogOpen(true);
  };

  const handlePioneerClick = (pioneerId: string) => {
    navigate({ to: "/pioneers/$id", params: { id: pioneerId } });
  };

  const fetchPioneersData = async () => {
    if (!actor || !pioneers || pioneers.length === 0) {
      toast.error("No data to export");
      return null;
    }

    const pioneersData = await Promise.all(
      pioneers.map(async (pioneer) => {
        const monthlyHoursRecords = await actor.getPioneerHoursForServiceYear(
          pioneer.id,
          pioneer.serviceYear,
        );

        const monthlyHoursMap: Record<string, number> = {};
        for (const record of monthlyHoursRecords) {
          monthlyHoursMap[record.month] = Number(record.hours);
        }

        const totalHours = monthlyHoursRecords.reduce(
          (sum, record) => sum + Number(record.hours),
          0,
        );
        const averageHours =
          monthlyHoursRecords.length > 0
            ? totalHours / monthlyHoursRecords.length
            : 0;

        let currentStatus = "No Entries";
        if (monthlyHoursRecords.length > 0) {
          currentStatus = averageHours >= 50 ? "On Track" : "Behind";
        }

        return {
          pioneerName: pioneer.publisherName,
          serviceYear: pioneer.serviceYear,
          totalHours,
          averageHours,
          currentStatus,
          monthlyHours: monthlyHoursMap,
        };
      }),
    );

    pioneersData.sort((a, b) => a.pioneerName.localeCompare(b.pioneerName));
    return pioneersData;
  };

  const handleExportToCsv = async () => {
    setIsExporting(true);
    try {
      const pioneersData = await fetchPioneersData();
      if (!pioneersData) return;
      const csvContent = buildPioneersCsv(pioneersData);
      downloadCsv(csvContent, "pioneers-export.csv");
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPdf = async () => {
    setIsExportingPdf(true);
    try {
      const pioneersData = await fetchPioneersData();
      if (!pioneersData) return;
      await exportPioneersToPdf(pioneersData);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Sort pioneers alphabetically by publisher name
  const sortedPioneers = pioneers
    ? [...pioneers].sort((a, b) =>
        a.publisherName.localeCompare(b.publisherName),
      )
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Pioneers</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportToCsv}
            disabled={isExporting || !pioneers || pioneers.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export to CSV"}
          </Button>
          <Button
            onClick={handleExportToPdf}
            disabled={isExportingPdf || !pioneers || pioneers.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isExportingPdf ? "Exporting..." : "Export to PDF"}
          </Button>
          <ThemedPrimaryButton
            themeColor={themeColor}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Pioneer
          </ThemedPrimaryButton>
        </div>
      </div>

      {/* Add Pioneer Modal */}
      <AddPioneerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        publishers={publishers}
        publishersLoading={publishersLoading}
      />

      {/* Edit Pioneer Modal */}
      <EditPioneerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPioneer(null);
        }}
        pioneer={selectedPioneer}
        publishers={publishers}
        publishersLoading={publishersLoading}
      />

      {/* Delete Pioneer Dialog */}
      <DeletePioneerDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPioneer(null);
        }}
        pioneer={selectedPioneer}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedPioneers.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No pioneers added. Click 'Add Pioneer' to create one.
          </p>
        </div>
      )}

      {/* Pioneers Table */}
      {!isLoading && sortedPioneers.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <ThemedTableHeaderRow themeColor={themeColor}>
                <ThemedTableHead themeColor={themeColor}>Name</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  Service Year
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  Total Hours
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  Average Hours
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  Current Status
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor} className="text-right">
                  Actions
                </ThemedTableHead>
              </ThemedTableHeaderRow>
            </TableHeader>
            <TableBody>
              {sortedPioneers.map((pioneer) => (
                <PioneerTableRow
                  key={pioneer.id}
                  pioneer={pioneer}
                  onPioneerClick={handlePioneerClick}
                  onEdit={handleEditPioneer}
                  onDelete={handleDeletePioneer}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
