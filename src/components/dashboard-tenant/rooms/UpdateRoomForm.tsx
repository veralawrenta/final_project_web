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
import { useGetTenantProperties } from "@/hooks/useProperty";
import {
  useDeleteRoomImage,
  useGetTenantRooms,
  useUpdateRoom,
  useUploadRoomImages,
} from "@/hooks/useRoom";
import { updateRoomSchema } from "@/lib/validator/dashboard.rooms.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import RoomImageUploader from "./RoomImageUploader";
import { RichTextEditor } from "@/components/RichTextEditor";
const UpdateRoomForm = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = Number(params.id);

  const { data: tenantRooms, isPending: roomsLoading } = useGetTenantRooms();
  const { data: tenantProperties, isPending: propertiesLoading } =
    useGetTenantProperties();
  const { mutateAsync: updateRoom } = useUpdateRoom();
  const { mutateAsync: uploadRoomImages } = useUploadRoomImages();
  const { mutateAsync: deleteRoomImage } = useDeleteRoomImage();

  const [newImages, setNewImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const roomData = tenantRooms?.data?.find((room) => room.id === roomId);
  const existingImages = roomData?.roomImages || [];

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
        description: roomData.description || "",
        basePrice: roomData.basePrice,
        totalGuests: roomData.totalGuests,
        totalUnits: roomData.totalUnits,
      });
    }
  }, [roomData, form]);

  useEffect(() => {
    return () => {
      newImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const hasFormChanges = useMemo(() => {
    if (!roomData) return false;

    const values = form.getValues();
    const hasFieldChanges =
      values.name !== roomData.name ||
      values.description !== (roomData.description || "") ||
      values.basePrice !== roomData.basePrice ||
      values.totalGuests !== roomData.totalGuests ||
      values.totalUnits !== roomData.totalUnits;

    const hasNewImages = newImageFiles.length > 0;

    return hasFieldChanges || hasNewImages;
  }, [form.watch(), newImageFiles.length, roomData]);

  const handleCancel = () => {
    router.push("/dashboard/tenant/room");
  };

  const handleImagesChange = (images: string[], files: File[]) => {
    setNewImages(images);
    setNewImageFiles(files);
  };

  const handleDeleteImage = async (roomImageId: number) => {
    try {
      await deleteRoomImage(roomImageId);
      setImageToDelete(null);
    } catch (error) {
      console.error("Delete image failed:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof updateRoomSchema>) => {
    setIsSubmitting(true);
    try {
      await updateRoom({
        roomId,
        data: {
          name: values.name,
          description: values.description,
          basePrice: values.basePrice,
          totalGuests: values.totalGuests,
          totalUnits: values.totalUnits,
        },
      });

      if (newImageFiles.length > 0) {
        await uploadRoomImages({
          roomId,
          images: newImageFiles,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard/tenant/room");
    } catch (error) {
      console.error("Update room failed:", error);
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

  return (
    <div className="space-y-6">
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
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={roomData.property?.name}
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
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Property cannot be changed after room creation
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Room Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      {...field}
                      placeholder="e.g., Superior, Deluxe"
                    />
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
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Describe the features..."
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="basePrice">
                      Base Price (per night)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          Rp
                        </span>
                        <Input
                          id="basePrice"
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
                    <FormLabel htmlFor="totalGuests">Maximum Guests</FormLabel>
                    <FormControl>
                      <Input
                        id="totalGuests"
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
                  <FormLabel htmlFor="totalUnits">
                    Total Units Available
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="totalUnits"
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
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Current Room Images</FormLabel>
                <div className="grid grid-cols-5 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={img.id} className="relative group">
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

                      <button
                        type="button"
                        onClick={() => setImageToDelete(img.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <FormLabel>
                {existingImages.length > 0
                  ? "Add More Images"
                  : "Upload Room Images"}
              </FormLabel>
              <RoomImageUploader
                images={newImages}
                imageFiles={newImageFiles}
                onImagesChange={handleImagesChange}
                maxImages={3 - existingImages.length}
              />
              {newImageFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {newImageFiles.length} new image(s) will be uploaded when you
                  save.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !hasFormChanges}>
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
      <AlertDialog
        open={imageToDelete !== null}
        onOpenChange={(open) => !open && setImageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => imageToDelete && handleDeleteImage(imageToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UpdateRoomForm;
