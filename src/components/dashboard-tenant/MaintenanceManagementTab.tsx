"use client";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGetTenantRooms } from "@/hooks/useRoom";
import {
  useGetRoomNonAvailability,
  useDeleteRoomNonAvailability,
} from "@/hooks/useRoomNonAvailability";
import { RoomNonAvailability } from "@/types/room";
import SelectedDatePanel from "./maintenance/SelectedDatePanel";
import MaintenanceList from "./maintenance/MaintenanceList";
import MaintenanceDeleteDialog from "./maintenance/MaintenanceDeleteDialog";
import MaintenanceCalendar from "./maintenance/MaintenanceCalendar";

const MaintenanceManagementTab = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RoomNonAvailability | null>(null);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const { data: allRecords, isLoading: allLoading } =
    useGetRoomNonAvailability({ page: 1, take: 100 });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debounceSearch] = useDebounceValue(search, 500);
  const { data: paginatedRecords, isLoading: listLoading } =
    useGetRoomNonAvailability({ page, take: 10, search: debounceSearch });

  const { data: tenantRooms } = useGetTenantRooms();
  const rooms = tenantRooms?.data || [];

  // ─── Mutations ────────────────────────────────────────────────────────────
  const deleteBlock = useDeleteRoomNonAvailability();

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleEdit = (record: RoomNonAvailability) => {
    router.push(`/dashboard/tenant/maintenance/update/${record.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlock.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Maintenance Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and schedule maintenance across properties
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/dashboard/tenant/maintenance/create")}
        >
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Calendar + Selected Date Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-heading font-semibold mb-4">Maintenance Calendar</h3>
          <MaintenanceCalendar
            records={allRecords?.data}
            isLoading={allLoading}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
        </div>

        <SelectedDatePanel
          selectedDate={selectedDate}
          allRecords={allRecords?.data}
          rooms={rooms}
          onNavigateToCreate={() => router.push("/dashboard/tenant/maintenance/create")}
          onEditBlock={handleEdit}
          onDeleteBlock={setDeleteTarget}
        />
      </div>

      {/* Paginated List */}
      <MaintenanceList
        data={paginatedRecords}
        rooms={rooms}
        isLoading={listLoading}
        search={search}
        onSearchChange={setSearch}
        onPageChange={(p) => setPage(p)}
        onEditBlock={handleEdit}
        onDeleteBlock={setDeleteTarget}
      />

      {/* Delete Dialog */}
      <MaintenanceDeleteDialog
        record={deleteTarget}
        rooms={rooms}
        isDeleting={deleteBlock.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MaintenanceManagementTab;