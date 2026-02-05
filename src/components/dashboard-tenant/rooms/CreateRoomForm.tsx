"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createRoomSchema } from "@/lib/validator/dashboard.rooms.schema";
import { useCreateRoom } from "@/hooks/useRoom";
import { useGetTenantProperties } from "@/hooks/useProperty";
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

const CreateRoomForm = () => {
  const router = useRouter();
  const { data: tenantProperties, isLoading: propertiesLoading } = useGetTenantProperties();
  const { mutateAsync: createRoom } = useCreateRoom();

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      propertyId: undefined,
      name: "",
      description: "",
      basePrice: 0,
      totalGuests: 1,
      totalUnits: 1,
      urlImages: [],
    },
  });

  const handleCancel = () => {
    // Cleanup preview URLs
    images.forEach((url) => URL.revokeObjectURL(url));
    router.push("/dashboard/tenant/room");
  };

  const onSubmit = async (values: z.infer<typeof createRoomSchema>) => {
    setIsSubmitting(true);

    try {
      const roomData = {
        name: values.name,
        description: values.description,
        basePrice: values.basePrice,
        totalGuests: values.totalGuests,
        totalUnits: values.totalUnits,
        urlImages: imageFiles,
      };

      await createRoom({
        propertyId: values.propertyId,
        room: roomData,
      });

      // Cleanup preview URLs
      images.forEach((url) => URL.revokeObjectURL(url));

      // Navigate to room list
      router.push("/dashboard/tenant/room");
    } catch (error) {
      // Error is already handled by the hook with toast
      console.error("Create room failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync imageFiles state with form's urlImages field
  const handleImagesChange = (newImages: string[], newFiles: File[]) => {
    setImages(newImages);
    setImageFiles(newFiles);
    form.setValue("urlImages", newFiles, { shouldValidate: true });
  };

  if (propertiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
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
            Create New Room
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new room to your property
          </p>
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
                  <FormLabel>Property *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
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
                  <FormLabel>Room Name *</FormLabel>
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
                  <FormLabel>Description *</FormLabel>
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

            {/* Base Price and Total Guests */}
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (per night) *</FormLabel>
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
                    <FormLabel>Maximum Guests *</FormLabel>
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

            {/* Total Units */}
            <FormField
              control={form.control}
              name="totalUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Units Available *</FormLabel>
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

            {/* Room Images Upload */}
            <FormField
              control={form.control}
              name="urlImages"
              render={({ field }) => (
                <FormItem>
                  <RoomImageUploader
                    images={images}
                    imageFiles={imageFiles}
                    onImagesChange={handleImagesChange}
                    maxImages={10}
                  />
                  <FormMessage />
                  {imageFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {imageFiles.length} image(s) selected. The first image will be set as the cover photo.
                    </p>
                  )}
                </FormItem>
              )}
            />

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
                    Creating...
                  </>
                ) : (
                  "Create Room"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateRoomForm;