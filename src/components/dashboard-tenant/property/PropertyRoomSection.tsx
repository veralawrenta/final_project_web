import { Plus, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { PropertyRoom } from '@/types/property';

interface PropertyRoomsSectionProps {
  rooms: PropertyRoom[];
  onAddRoom: () => void;
  onRemoveRoom: (roomId: string) => void;
}

export function PropertyRoomsSection({
  rooms,
  onAddRoom,
  onRemoveRoom,
}: PropertyRoomsSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>
          Rooms <span className="text-destructive">*</span>
        </FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddRoom}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Room
        </Button>
      </div>

      {rooms.length > 0 ? (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                {room.imagePreviews.length > 0 && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border border-border">
                    <img
                      src={
                        room.imagePreviews.find((i) => i.isCover)?.preview ||
                        room.imagePreviews[0]?.preview
                      }
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{room.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Rp {room.basePrice.toLocaleString()}/night •{' '}
                    {room.totalGuests} guests • {room.totalUnits} units •{' '}
                    {room.imageFiles.length} images
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveRoom(room.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg text-center">
          <Home className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No rooms added yet</p>
          <p className="text-xs text-destructive mt-1">At least 1 room required</p>
        </div>
      )}
    </div>
  );
}