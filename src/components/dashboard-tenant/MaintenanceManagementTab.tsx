"use client";
import { Button } from "@/components/ui/button";
import { useGetTenantRooms } from "@/hooks/useRoom";
import {
  useDeleteRoomNonAvailability,
  useGetRoomNonAvailability,
} from "@/hooks/useRoomNonAvailability";
import { RoomNonAvailability } from "@/types/room";
import { Plus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import MaintenanceDeleteDialog from "./maintenance/MaintenanceDeleteDialog";
import MaintenanceList from "./maintenance/MaintenanceList";
import Image from "next/image";

const MaintenanceManagementTab = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RoomNonAvailability | null>(null);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", { defaultValue: "createdAt" });
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", { defaultValue: "desc" });
  const [debounceSearch] = useDebounceValue(search, 500);

  const { data: paginatedRecords, isLoading: listLoading } = useGetRoomNonAvailability({ 
    page, 
    take: 3, 
    search: debounceSearch,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  const { data: tenantRooms } = useGetTenantRooms();
  const rooms = tenantRooms?.data || [];
  const deleteBlock = useDeleteRoomNonAvailability();

  const handleEdit = (record: RoomNonAvailability) => {
    router.push(`/dashboard/tenant/maintenance/update/${record.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlock.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8 max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Maintenance Management
          </h1>
          <p className="text-muted-foreground">
            Monitor your schedule routine property repairs.
          </p>
        </div>
        <Button
          className="gap-2 shadow-lg rounded-xl px-6 h-11"
          onClick={() => router.push("/dashboard/tenant/maintenance/create")}
        >
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="pt-6">
        {listLoading && !paginatedRecords ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 w-full border-2 border-dashed border-border/60 rounded-[3rem] bg-muted/5">
            <div className="relative h-20 w-20 animate-pulse">
              <Image
                src="/images/nuit-logo.png"
                fill
                alt="Loading..."
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">
                Syncing maintenance records...
              </p>
            </div>
          </div>
        ) : paginatedRecords?.data?.length === 0 && !search ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-24 px-8 border-2 border-dashed border-border/60 rounded-[3rem] bg-linear-to-b from-muted/20 to-transparent">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
            
            <div className="h-24 w-24 bg-background rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-border flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0 duration-500">
              <ShieldCheck className="h-12 w-12 text-primary/40" />
            </div>

            <h3 className="text-3xl font-bold tracking-tight text-center mb-3">
              All Rooms Operational
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-10 leading-relaxed text-lg">
              No active maintenance blocks detected. Your inventory is currently at 100% capacity.
            </p>

            <Button 
              className="rounded-2xl px-12 h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => router.push("/dashboard/tenant/maintenance/create")}
            >
              <Plus className="h-5 w-5 mr-3" />
              Create First Record
            </Button>
          </div>
        ) : (
          <MaintenanceList
            data={paginatedRecords}
            rooms={rooms}
            isLoading={listLoading}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearchChange={setSearch}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            onPageChange={(p) => setPage(p)}
            onEditBlock={handleEdit}
            onDeleteBlock={setDeleteTarget}
          />
        )}
      </div>

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