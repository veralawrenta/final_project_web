"use client";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { updateRoomSchema } from "@/lib/validator/dashboard.rooms.schema";
import { useGetTenantRooms, useUpdateRoom } from "@/hooks/useRoom";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useSession } from "next-auth/react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import RoomImageUploader from "./RoomImageUploader";

const UpdateRoomForm = () => {
  const router = useRouter();
  const params = useParams();
  const session = useSession();
  const roomId = Number(params.id);

  const { data: tenantRooms, isPending: roomsLoading } = useGetTenantRooms();
  const { data: tenantProperties, isPending: propertiesLoading } =
    useGetTenantProperties();
  const { mutateAsync: updateRoom } = useUpdateRoom();

  const [newImages, setNewImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roomData = tenantRooms?.data?.find((room) => room.id === roomId);

  const form = useForm<z.infer<typeof updateRoomSchema>>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      propertyId: 0,
      name: "",
      description: "",
      basePrice: 0,
      totalGuests: 1,
      totalUnits: 1,
    },
  });

  useEffect(() => {
    if (roomData) {
      form.reset({
        propertyId: roomData.propertyId,
        name: roomData.name,
        description: roomData.description,
        basePrice: roomData.basePrice,
        totalGuests: roomData.totalGuests,
        totalUnits: roomData.totalUnits,
      });
    }
  }, [roomData, form]);

  const handleCancel = () => {
    newImages.forEach((url) => URL.revokeObjectURL(url));
    router.push("/dashboard/tenant/room");
  };

  const onSubmit = async (values: z.infer<typeof updateRoomSchema>) => {
    setIsSubmitting(true);

    try {
      toast.loading("Updating room...", { id: "update-room" });
      await updateRoom(values);
      toast.success("Room updated!", { id: "update-room" });

      // Step 2: Upload new images if any (one by one)
      if (newImageFiles.length > 0) {
        toast.loading(`Uploading ${newImageFiles.length} new image(s)...`, {
          id: "upload-images",
        });

        const existingImagesCount = roomData?.roomImages?.length || 0;

        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const formData = new FormData();
          formData.append("urlImage", file); // ✅ Correct field name
          // Set as cover only if no existing images and this is the first new image
          formData.append(
            "isCover",
            String(existingImagesCount === 0 && i === 0)
          );

          await axiosInstance.post(`/room-images/room/${roomId}`, formData, {
            headers: {
              Authorization: `Bearer ${session.data?.user.accessToken}`,
            },
          });
        }

        toast.success("All images uploaded!", { id: "upload-images" });
      }

      // Cleanup preview URLs
      newImages.forEach((url) => URL.revokeObjectURL(url));
      toast.success("Room updated successfully!");
      router.push("/dashboard/tenant/room");
    } catch (error) {
      console.error("Update room failed:", error);
      toast.error("Failed to update room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (roomsLoading || propertiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading room details...</p>
      </div>
    );
  }
  if (!roomData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Room not found</p>
        <Button onClick={handleCancel}>Back to Rooms</Button>
      </div>
    );
  }

  const existingImages = roomData.roomImages || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Property Selection */}
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenantProperties?.data?.map((property: any) => (
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Units Available</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Room Images Display */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Current Room Images</FormLabel>
                <div className="grid grid-cols-5 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        <img
                          src={img.urlImages}
                          alt={`Room image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {img.isCover && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Room Images */}
            <div className="space-y-2">
              <FormLabel>
                {existingImages.length > 0
                  ? "Add More Images"
                  : "Upload Room Images"}
              </FormLabel>
              <RoomImageUploader
                images={newImages}
                setImages={setNewImages}
                imageFiles={newImageFiles}
                setImageFiles={setNewImageFiles}
                maxImages={5}
              />
              {newImageFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {newImageFiles.length} new image(s) will be uploaded when you
                  save.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Room"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
export default UpdateRoomForm;
