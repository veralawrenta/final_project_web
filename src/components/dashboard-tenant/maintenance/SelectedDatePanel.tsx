"use client";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room, RoomNonAvailability } from "@/types/room";
import { fromDateString, isWithinRange } from "@/lib/date/date";

interface SelectedDatePanelProps {
  selectedDate: Date | undefined;
  allRecords: RoomNonAvailability[] | undefined;
  rooms: Room[];
  onNavigateToCreate: () => void;
  onEditBlock: (record: RoomNonAvailability) => void;
  onDeleteBlock: (record: RoomNonAvailability) => void;
}

const SelectedDatePanel = ({
  selectedDate,
  allRecords,
  rooms,
  onNavigateToCreate,
  onEditBlock,
  onDeleteBlock,
}: SelectedDatePanelProps) => {
  // Filter records whose range includes the selected date
  const selectedDateRecords = useMemo(() => {
    if (!selectedDate || !allRecords) return [];
    return allRecords.filter((record) =>
      isWithinRange(
        selectedDate,
        fromDateString(record.startDate),
        fromDateString(record.endDate)
      )
    );
  }, [selectedDate, allRecords]);

  // Prefer nested room name from paginated include, fall back to room list lookup
  const getRoomName = (record: RoomNonAvailability) => {
    if (record.room?.name) return record.room.name;
    const match = rooms.find((r) => r.id === record.roomId);
    return match?.name || `Room #${record.roomId}`;
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold">
          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
        </h3>
        {selectedDate && (
          <Button size="sm" className="gap-1" onClick={onNavigateToCreate}>
            <Plus className="h-3.5 w-3.5" />
            Block Date
          </Button>
        )}
      </div>

      {/* Records for this date */}
      {selectedDateRecords.length > 0 ? (
        <div className="space-y-3">
          {selectedDateRecords.map((record) => (
            <div key={record.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
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
                  <p className="font-medium text-sm">{getRoomName(record)}</p>
                  {record.reason && (
                    <p className="text-sm text-muted-foreground mt-0.5">{record.reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {format(fromDateString(record.startDate), "MMM d, yyyy")}
                    {" "}&ndash;{" "}
                    {format(fromDateString(record.endDate), "MMM d, yyyy")}
                  </p>
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
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-muted-foreground">No maintenance blocked for this date</p>
        </div>
      )}
    </div>
  );
};

export default SelectedDatePanel;