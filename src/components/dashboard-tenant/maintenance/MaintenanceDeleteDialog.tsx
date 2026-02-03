"use client";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Room, RoomNonAvailability } from "@/types/room";
import { fromDateString } from "@/lib/date/date";

interface MaintenanceDeleteDialogProps {
  record: RoomNonAvailability | null;
  rooms: Room[];
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const MaintenanceDeleteDialog = ({
  record,
  rooms,
  isDeleting,
  onConfirm,
  onClose,
}: MaintenanceDeleteDialogProps) => {
  const getRoomName = () => {
    if (!record) return "";
    if (record.room?.name) return record.room.name;
    const match = rooms.find((r) => r.id === record.roomId);
    return match?.name || `Room #${record.roomId}`;
  };

  return (
    <AlertDialog open={!!record} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Maintenance Block</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the maintenance block for{" "}
            <strong>{getRoomName()}</strong> (
            {record && format(fromDateString(record.startDate), "MMM d, yyyy")}{" "}
            &ndash;{" "}
            {record && format(fromDateString(record.endDate), "MMM d, yyyy")}
            )? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MaintenanceDeleteDialog;
