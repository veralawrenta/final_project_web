"use client";
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
    const match = rooms.find((r) => r.id === record.room?.id);
    return match?.name || `Room #${record.room?.id}`;
  };

  return (
    <AlertDialog open={!!record} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Maintenance Block</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the maintenance block for{" "}
            <strong>{getRoomName()}</strong> ? This action cannot be undone.
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
