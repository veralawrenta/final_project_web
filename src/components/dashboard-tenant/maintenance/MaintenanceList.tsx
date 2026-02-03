"use client";
import { format } from "date-fns";
import { Search, Trash2, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Room, RoomNonAvailability } from "@/types/room";
import PaginationSection from "@/components/PaginationSection";
import { PageableResponse } from "@/types/pagination";
import { fromDateString } from "@/lib/date/date";

interface MaintenanceListProps {
  data: PageableResponse<RoomNonAvailability> | undefined;
  rooms: Room[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEditBlock: (record: RoomNonAvailability) => void;
  onDeleteBlock: (record: RoomNonAvailability) => void;
}

const MaintenanceList = ({
  data,
  rooms,
  isLoading,
  search,
  onSearchChange,
  onPageChange,
  onEditBlock,
  onDeleteBlock,
}: MaintenanceListProps) => {
  const getRoomName = (record: RoomNonAvailability) => {
    if (record.room?.name) return record.room.name;
    const match = rooms.find((r) => r.id === record.roomId);
    return match?.name || `Room #${record.roomId}`;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search maintenance..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {!isLoading &&
          data?.data?.map((record) => (
            <div key={record.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold font-mono">
                      ID: {record.id}
                    </span>
                    <span className="px-2 py-0.5 bg-warning/10 text-warning rounded text-xs font-medium">
                      Blocked
                    </span>
                    <span className="px-2 py-0.5 bg-secondary rounded text-xs font-medium">
                      {record.roomInventory} unit{record.roomInventory > 1 ? "s" : ""}
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold">{getRoomName(record)}</h3>
                  {record.reason && (
                    <p className="text-sm text-muted-foreground mt-1">{record.reason}</p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    {format(fromDateString(record.startDate), "MMM d, yyyy")}
                    {" "}&ndash;{" "}
                    {format(fromDateString(record.endDate), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditBlock(record)}
                    title="Edit Block"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteBlock(record)}
                    title="Delete Block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">No maintenance records found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!!data?.meta && (
        <PaginationSection meta={data.meta} onChangePage={onPageChange} />
      )}
    </div>
  );
};

export default MaintenanceList;