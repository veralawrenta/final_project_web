"use client";
import PaginationSection from "@/components/PaginationSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatLocalDate, fromDateString } from "@/lib/date/date";
import { PageableResponse } from "@/types/pagination";
import { Room, RoomNonAvailability } from "@/types/room";
import { Edit, Loader2, Search, Trash2 } from "lucide-react";

interface MaintenanceListProps {
  data: PageableResponse<RoomNonAvailability> | undefined;
  rooms: Room[];
  isLoading: boolean;
  search: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEditBlock: (record: RoomNonAvailability) => void;
  onDeleteBlock: (record: RoomNonAvailability) => void;
}

const MaintenanceList = ({
  data,
  rooms,
  isLoading,
  search,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onPageChange,
  onEditBlock,
  onDeleteBlock,
}: MaintenanceListProps) => {
  const getRoomName = (values: RoomNonAvailability) => {
    if (values.room?.name) return values.room.name;
    const match = rooms.find((r) => r.id === values.id);
    return match?.name || `Room #${values.id}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search maintenance..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="reason">Reason</SelectItem>
            <SelectItem value="roomName">Room Name</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">A to Z</SelectItem>
            <SelectItem value="desc">Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                    <span className="px-2 py-0.5 bg-warning/10 text-warning rounded text-xs font-semibold">
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
                    {formatLocalDate(fromDateString(record.startDate.split("T")[0]))} to{" "}
                    {formatLocalDate(fromDateString(record.endDate.split("T")[0]))}
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
      {!!data?.meta && (
        <PaginationSection meta={data.meta} onChangePage={onPageChange} />
      )}
    </div>
  );
};

export default MaintenanceList;