"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewImageData } from "@/types/images";
import {
  Check,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Users,
  Bed,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RoomData, RoomFormCard } from "./RoomFormCard";
import { formatCurrency } from "@/lib/price/currency";

export interface SavedRoom {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  totalGuests: number;
  totalUnits: number;
  images: NewImageData[];
}

interface CreatePropertyStep2Props {
  onComplete: (rooms: SavedRoom[]) => void;
  isLoading?: boolean;
}

export function CreatePropertyStep2Form({
  onComplete,
  isLoading,
}: CreatePropertyStep2Props) {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const handleAddNewRoom = () => {
    setEditingRoomId(null);
    setShowForm(true);
  };

  const handleEditRoom = (room: SavedRoom) => {
    setEditingRoomId(room.id);
    setShowForm(true);
  };

  const handleDeleteRoom = (roomId: number) => {
    setSavedRooms(savedRooms.filter((r) => r.id !== roomId));
    toast.success("Room removed");
  };

  const handleSaveRoom = (data: RoomData) => {
    if (editingRoomId) {
      setSavedRooms(
        savedRooms.map((room) =>
          room.id === editingRoomId ? { ...room, ...data } : room
        )
      );
      toast.success("Room updated");
    } else {
      const newRoom: SavedRoom = {
        id: Date.now(),
        ...data,
      };
      setSavedRooms([...savedRooms, newRoom]);
    }

    setShowForm(false);
    setEditingRoomId(null);
  };

  const handleCancelForm = () => {
    if (savedRooms.length > 0) {
      setShowForm(false);
      setEditingRoomId(null);
    }
  };

  const handleComplete = () => {
    if (savedRooms.length === 0) {
      toast.error("Add at least one room");
      return;
    }

    onComplete(savedRooms);
  };

  const editingRoom = editingRoomId
    ? savedRooms.find((r) => r.id === editingRoomId)
    : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Add Rooms</h1>
        <p className="text-sm text-muted-foreground">
          Your property has been created. Now add rooms to publish it.
        </p>
        <p className="text-sm text-muted-foreground">
          Step 2 of 2 • Create Room and Images
        </p>
      </div>
      <div className="flex gap-2">
        <div className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-800 " />
        <div className="h-1 flex-1 rounded-full bg-primary" />
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Required:</strong> Add at least one room to publish your property. You can add more rooms later from the property dashboard.
        </p>
      </div>

      {savedRooms.length > 0 && !showForm && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Rooms ({savedRooms.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-start gap-4 p-3 rounded-md border hover:border-primary/50 transition-colors"
              >
                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
                  {room.images[0] && (
                    <img
                      src={room.images[0].preview}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{room.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {room.description.replace(/<[^>]*>/g, '')}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs gap-1">
                      {formatCurrency(room.basePrice)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Users className="h-3 w-3" />
                      {room.totalGuests}
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Bed className="h-3 w-3" />
                      {room.totalUnits}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRoom(room)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <RoomFormCard
          onSubmit={handleSaveRoom}
          onCancel={savedRooms.length > 0 ? handleCancelForm : undefined}
          isLoading={false}
          submitLabel={editingRoomId ? "Update Room" : "Save Room"}
          showSecondaryAction={!editingRoomId}
          //secondaryActionLabel="Save & Add Another"
         // onSecondaryAction={handleSaveAndAddAnother}
          title={editingRoomId ? "Edit Room" : "Add Room"}
          description={editingRoomId ? "Update room details" : "Fill in room details"}
          initialData={editingRoom}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          onClick={handleComplete}
          disabled={savedRooms.length === 0 || isLoading}
          size="lg"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Check className="h-4 w-4 mr-2" />
          Publish Property
        </Button>
      </div>
    </div>
  );
}