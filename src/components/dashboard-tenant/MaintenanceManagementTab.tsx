"use client";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { Plus, Calendar as CalendarIcon, Wrench, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGetTenantRooms } from "@/hooks/useRoom";
import {
  useGetRoomNonAvailability,
  useDeleteRoomNonAvailability,
} from "@/hooks/useRoomNonAvailability";
import { RoomNonAvailability } from "@/types/room";
import { Skeleton } from "@/components/ui/skeleton";
import SelectedDatePanel from "./maintenance/SelectedDatePanel";
import MaintenanceList from "./maintenance/MaintenanceList";
import MaintenanceDeleteDialog from "./maintenance/MaintenanceDeleteDialog";
import MaintenanceCalendar from "./maintenance/MaintenanceCalendar";
import { DateRange } from "react-day-picker";

const MaintenanceManagementTab = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RoomNonAvailability | null>(null);

  const { data: allRecords, isLoading: allLoading } = useGetRoomNonAvailability({ 
    page: 1, 
    take: 100 
  });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debounceSearch] = useDebounceValue(search, 500);

  const { data: paginatedRecords, isLoading: listLoading } = useGetRoomNonAvailability({ 
    page, 
    take: 10, 
    search: debounceSearch 
  });

  const { data: tenantRooms } = useGetTenantRooms();
  const rooms = tenantRooms?.data || [];
  const deleteBlock = useDeleteRoomNonAvailability();

  const handleDateSelect = (date: Date | undefined) => setSelectedDate(date);
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Maintenance Management
          </h1>
          <p className="text-muted-foreground">
            Monitor asset availability and schedule routine property repairs.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Calendar Card */}
        <div className="bg-card rounded-4xl border border-border p-6 flex flex-col h-auto min-h-fit shadow-sm overflow-visible">
          <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-5">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg">Availability Calendar</h3>
          </div>

          <div className="w-full flex justify-center px-2">
            <div className="w-full max-w-[440px]">
              <MaintenanceCalendar
                records={allRecords?.data}
                isLoading={allLoading}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />
            </div>
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="h-full min-h-[400px]">
          {allLoading ? (
            <div className="bg-card rounded-4xl border border-border p-8 space-y-6 shadow-sm h-full">
              <Skeleton className="h-8 w-1/3 rounded-lg" />
              <Skeleton className="h-56 w-full rounded-3xl" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
              </div>
            </div>
          ) : (
            <SelectedDatePanel
              selectedDate={selectedDate}
              allRecords={allRecords?.data}
              rooms={rooms}
              onNavigateToCreate={() => router.push("/dashboard/tenant/maintenance/create")}
              onEditBlock={handleEdit}
              onDeleteBlock={setDeleteTarget}
            />
          )}
        </div>
      </div>

      {/* Maintenance List / Empty State */}
      <div className="pt-6">
        {listLoading && !paginatedRecords ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <div className="border border-border rounded-4xl p-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ) : paginatedRecords?.data?.length === 0 && !search ? (
          /* MODERN PROFESSIONAL EMPTY STATE */
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-24 px-8 border-2 border-dashed border-border/60 rounded-[3rem] bg-linear-to-b from-muted/20 to-transparent">
            {/* Background Accent */}
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
            onSearchChange={setSearch}
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