// components/rooms/UpdateRoomPage.tsx
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUploadRoomImages, useUpdateRoom } from "@/hooks/useRoom";
import { updateRoomSchema } from "@/lib/validator/dashboard.rooms.schema";
import { Room } from "@/types/room";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import RoomImageUploader from "./RoomImageUploader";

interface UpdateRoomFormProps {
  onCancel: () => void;
  tenantProperties: Array<{ id: number; title: string }>;
  roomData: Room;
}

const UpdateRoomPage = ({
  onCancel,
  tenantProperties,
  roomData,
}: UpdateRoomFormProps) => {
  const { mutateAsync: updateRoom, isPending } = useUpdateRoom();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadRoomImages } = useUploadRoomImages();

  // Existing images from server
  const [existingImages, setExistingImages] = useState(
    roomData.roomImages || []
  );

  // New images to upload
  const [newImages, setNewImages] = useState<string[]>([]); // Preview URLs
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // Actual files

  const form = useForm<z.infer<typeof updateRoomSchema>>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      propertyId: roomData.propertyId,
      name: roomData.name,
      description: roomData.description,
      basePrice: roomData.basePrice,
      totalGuests: roomData.totalGuests,
      totalUnits: roomData.totalUnit,
    },
  });

  // Update form when roomData changes
  useEffect(() => {
    form.reset({
      propertyId: roomData.propertyId,
      name: roomData.name,
      description: roomData.description,
      basePrice: roomData.basePrice,
      totalGuests: roomData.totalGuests,
      totalUnits: roomData.totalUnit,
    });
    setExistingImages(roomData.roomImages || []);
  }, [roomData, form]);

  // Submit form
  const handleSubmit = async (values: z.infer<typeof updateRoomSchema>) => {
    try {
      // Step 1: Update room basic info (JSON)
      await updateRoom(values);

      // Step 2: Upload new images if any (FormData)
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach((file) => {
          formData.append("roomImages", file);
        });
        await uploadRoomImages({ roomImages: newImageFiles }); // separate hook
      };

      toast.success("Room updated successfully!");

      // Cleanup previews
      newImages.forEach((url) => URL.revokeObjectURL(url));

      onCancel();
    } catch (error) {
      console.error("Update room failed:", error);
      toast.error("Failed to update room");
    }
  };

  // Combine all images for display
  const allImages = [
    ...existingImages.map((img, index) => ({
      type: "existing" as const,
      url: img.urlImages,
      index,
    })),
    ...newImages.map((url) => ({
      type: "new" as const,
      url,
      index: newImages.indexOf(url),
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Edit Room
          </h1>
          <p className="text-muted-foreground mt-1">Update room details</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Property Selection */}
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                    disabled // Usually can't change property when editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenantProperties.map((property) => (
                        <SelectItem
                          key={property.id}
                          value={property.id.toString()}
                        >
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ocean View Suite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the room amenities, view, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price and Guests */}
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (per night)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          placeholder="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Guests</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        placeholder="2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Units */}
            <FormField
              control={form.control}
              name="totalUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Units Available</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Images */}
            <RoomImageUploader
              images={newImages}
              setImages={setNewImages}
              imageFiles={newImageFiles}
              setImageFiles={setNewImageFiles}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Room"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateRoomPage;
