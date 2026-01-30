"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createRoomSchema } from "@/lib/validator/dashboard.rooms.schema";
import { useCreateRoom } from "@/hooks/useRoom";
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


const CreateRoomForm = () => {
  const router = useRouter();
  const session = useSession();
  const { data: tenantProperties, isLoading: propertiesLoading } =
    useGetTenantProperties();
  const { mutateAsync: createRoom } = useCreateRoom();

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      propertyId: 0,
      name: "",
      description: "",
      basePrice: 0,
      totalGuests: 1,
      totalUnits: 1,
    },
  });

  const handleCancel = () => {
    // Cleanup preview URLs
    images.forEach((url) => URL.revokeObjectURL(url));
    router.push("/dashboard/tenant/rooms");
  };

  const onSubmit = async (values: z.infer<typeof createRoomSchema>) => {
    setIsSubmitting(true);

    try {
      // Step 1: Create the room
      toast.loading("Creating room...", { id: "create-room" });
      const createdRoom = await createRoom(values);
      const roomId = createdRoom.id; // Get the newly created room ID
      toast.success("Room created!", { id: "create-room" });

      // Step 2: Upload images if any (one by one)
      if (imageFiles.length > 0) {
        toast.loading(`Uploading ${imageFiles.length} image(s)...`, {
          id: "upload-images",
        });

        for (let i = 0; i < imageFiles.length; i++) {
          const formData = new FormData();
          formData.append("urlImage", imageFiles[i]);
          formData.append("isCover", String(i === 0));

          await axiosInstance.post(
            `/room-images/room/${roomId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${session.data?.user.accessToken}`,
              },
            }
          );
        }

        toast.success("All images uploaded!", { id: "upload-images" });
      };
      images.forEach((url) => URL.revokeObjectURL(url));

      // Success!
      toast.success("Room created successfully with images!");
      router.push("/dashboard/tenant/rooms");
    } catch (error) {
      console.error("Create room failed:", error);
      toast.error("Failed to create room");
    } finally {
      setIsSubmitting(false);
    }
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
                  <FormLabel>Property</FormLabel>
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

            {/* Total Units */}
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

            {/* Room Images Upload */}
            <div className="space-y-2">
              <RoomImageUploader
                images={images}
                setImages={setImages}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                maxImages={3}
              />
              {imageFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {imageFiles.length} image(s) selected. The first image will be set as the cover photo.
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