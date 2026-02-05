"use client"

import { useState, useRef } from 'react';
import { Upload, X, Plus, Minus, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PropertyRoom, PropertyRoomImage } from '@/types/property';

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom: (room: PropertyRoom) => void;
  onAddAnother: (room: PropertyRoom) => void;
}

export function RoomFormModal({
  open,
  onOpenChange,
  onAddRoom,
  onAddAnother,
}: RoomFormModalProps) {
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomBasePrice, setRoomBasePrice] = useState(0);
  const [roomTotalGuests, setRoomTotalGuests] = useState(2);
  const [roomTotalUnits, setRoomTotalUnits] = useState(1);
  const [roomImageFiles, setRoomImageFiles] = useState<File[]>([]);
  const [roomImagePreviews, setRoomImagePreviews] = useState<PropertyRoomImage[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setRoomName('');
    setRoomDescription('');
    setRoomBasePrice(0);
    setRoomTotalGuests(2);
    setRoomTotalUnits(1);
    setRoomImageFiles([]);
    setRoomImagePreviews([]);
  };

  const validateForm = () => {
    if (!roomName.trim()) {
      toast.error('Room name is required');
      return false;
    }
    if (roomBasePrice <= 0) {
      toast.error('Base price must be greater than 0');
      return false;
    }
    if (roomImageFiles.length === 0) {
      toast.error('At least one room image is required');
      return false;
    }
    return true;
  };

  const createRoom = (): PropertyRoom => ({
    id: `room-${Date.now()}-${Math.random()}`,
    name: roomName,
    description: roomDescription,
    basePrice: roomBasePrice,
    totalGuests: roomTotalGuests,
    totalUnits: roomTotalUnits,
    imageFiles: roomImageFiles,
    imagePreviews: roomImagePreviews,
  });

  const handleSaveRoom = () => {
    if (!validateForm()) return;
    onAddRoom(createRoom());
    resetForm();
    toast.success('Room added successfully');
  };

  const handleAddAnotherRoom = () => {
    if (!validateForm()) return;
    onAddAnother(createRoom());
    resetForm();
    toast.success('Room added! Add another or click Save');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + roomImageFiles.length > 10) {
      toast.error('Maximum 10 room images allowed');
      return;
    }

    const newFiles = [...roomImageFiles, ...files];
    setRoomImageFiles(newFiles);

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomImagePreviews((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
            isCover: roomImagePreviews.length === 0 && idx === 0,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = roomImageFiles.filter((_, i) => i !== index);
    const newPreviews = roomImagePreviews.filter((_, i) => i !== index);

    if (roomImagePreviews[index]?.isCover && newPreviews.length > 0) {
      newPreviews[0].isCover = true;
    }

    setRoomImageFiles(newFiles);
    setRoomImagePreviews(newPreviews);
  };

  const handleSetCover = (index: number) => {
    setRoomImagePreviews((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fill in room details and upload at least 1 image
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Room Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., Deluxe Ocean View Suite"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Describe the room amenities, view, etc."
              className="min-h-[80px]"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Base Price (per night) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                type="number"
                className="pl-10"
                placeholder="0"
                value={roomBasePrice || ''}
                onChange={(e) => setRoomBasePrice(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Guests</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setRoomTotalGuests(Math.max(1, roomTotalGuests - 1))}
                disabled={roomTotalGuests <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">
                {roomTotalGuests}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setRoomTotalGuests(Math.min(20, roomTotalGuests + 1))
                }
                disabled={roomTotalGuests >= 20}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Units</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setRoomTotalUnits(Math.max(1, roomTotalUnits - 1))}
                disabled={roomTotalUnits <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">
                {roomTotalUnits}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setRoomTotalUnits(Math.min(100, roomTotalUnits + 1))
                }
                disabled={roomTotalUnits >= 100}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Room Images <span className="text-destructive">*</span>
            </label>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload images
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF (max 1MB each) • {roomImageFiles.length}/10
              </p>
            </div>

            {roomImagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {roomImagePreviews.map((img, index) => (
                  <div key={index} className="relative group">
                    <div
                      className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${
                        img.isCover ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <img
                        src={img.preview}
                        alt={`Room image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {img.isCover && (
                      <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5" /> Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="absolute bottom-1 left-1 bg-background/80 text-foreground rounded px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Set Cover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {roomImageFiles.length === 0 && (
              <p className="text-xs text-destructive">At least 1 image required</p>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAnotherRoom}
              disabled={
                !roomName.trim() ||
                roomBasePrice <= 0 ||
                roomImageFiles.length === 0
              }
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add & Create Another
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveRoom}
                disabled={
                  !roomName.trim() ||
                  roomBasePrice <= 0 ||
                  roomImageFiles.length === 0
                }
              >
                Save Room
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}