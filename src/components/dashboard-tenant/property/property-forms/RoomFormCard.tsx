"use client";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { roomsWithImageSchema } from "@/lib/validator/dashboard.rooms.schema";
import { NewImageData } from "@/types/images";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type RoomFormData = z.infer<typeof roomsWithImageSchema>;

export interface RoomData {
  name: string;
  description: string;
  basePrice: number;
  totalGuests: number;
  totalUnits: number;
  images: NewImageData[];
}

interface RoomFormCardProps {
  onSubmit: (data: RoomData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  showSecondaryAction?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: (data: RoomData) => void;
  title?: string;
  description?: string;
  initialData?: Partial<RoomData>;
}

export function RoomFormCard({
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save Room",
  //showSecondaryAction = false,
  //secondaryActionLabel = "Save & Add Another",
  onSecondaryAction,
  title = "Room Details",
  description = "Fill in the room information and upload images",
  initialData,
}: RoomFormCardProps) {
  const [roomImages, setRoomImages] = useState<NewImageData[]>(
    initialData?.images || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomsWithImageSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      basePrice: initialData?.basePrice ?? 0,
      totalGuests: initialData?.totalGuests || 2,
      totalUnits: initialData?.totalUnits || 1,
      roomImages: initialData?.images?.map((img) => img.file) || [],
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - roomImages.length;
    if (remainingSlots === 0) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    const newImages: NewImageData[] = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isCover: roomImages.length === 0,
    }));

    const updatedImages = [...roomImages, ...newImages];
    setRoomImages(updatedImages);
    form.setValue(
      "roomImages",
      updatedImages.map((img) => img.file),
      { shouldValidate: true }
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = roomImages.filter((_, i) => i !== index);

    if (
      roomImages[index].isCover &&
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isCover)
    ) {
      updatedImages[0].isCover = true;
    }

    setRoomImages(updatedImages);
    form.setValue(
      "roomImages",
      updatedImages.map((img) => img.file),
      { shouldValidate: true }
    );

    URL.revokeObjectURL(roomImages[index].preview);
  };

  const setCoverImage = (index: number) => {
    const updatedImages = roomImages.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    setRoomImages(updatedImages);
  };

  const validateAndSubmit = (
    data: RoomFormData,
    callback: (roomData: RoomData) => void
  ) => {
    if (roomImages.length === 0) {
      toast.error("Please upload at least one room image");
      return;
    }

    if (!data.description.trim() || data.description === "<p></p>") {
      toast.error("Room description is required");
      return;
    }

    callback({
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      totalGuests: data.totalGuests,
      totalUnits: data.totalUnits,
      images: roomImages,
    });
  };

  const handlePrimarySubmit = (data: RoomFormData) => {
    validateAndSubmit(data, onSubmit);
  };

  const handleSecondarySubmit = (data: RoomFormData) => {
    if (onSecondaryAction) {
      validateAndSubmit(data, onSecondaryAction);
    }
  };

  const incrementField = (field: "totalGuests" | "totalUnits", max: number) => {
    const current = form.getValues(field);
    if (current < max) form.setValue(field, current + 1);
  };

  const decrementField = (field: "totalGuests" | "totalUnits", min: number) => {
    const current = form.getValues(field);
    if (current > min) form.setValue(field, current - 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Deluxe Ocean View Suite"
                      {...field}
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (per night) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          Rp
                        </span>
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="100000"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? 0 : Number(v));
                          }}
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
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="text-center"
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
                name="totalUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Units *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="text-center"
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
            </div>

            {/* Room Images Upload */}
            <div className="space-y-3">
              <FormLabel>Room Images *</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Click to upload room images
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10 images ({roomImages.length}/10)
                </p>
              </div>

              {roomImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roomImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border"
                    >
                      <img
                        src={img.preview}
                        alt={`Room image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {img.isCover && (
                        <Badge
                          className="absolute top-2 left-2 gap-1"
                          variant="default"
                        >
                          <Star className="h-3 w-3 fill-current" />
                          Cover
                        </Badge>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isCover && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImage(index);
                            }}
                            className="h-8 text-xs"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Set Cover
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {roomImages.length === 0 && (
                <p className="text-sm text-destructive">
                  At least one room image is required
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}

              {/*{showSecondaryAction && onSecondaryAction && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={form.handleSubmit(handleSecondarySubmit)}
                  disabled={isLoading || roomImages.length === 0}
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Plus className="h-4 w-4 mr-2" />
                  {secondaryActionLabel}
                </Button>
              )}*/}

              <Button
                type="button"
                onClick={form.handleSubmit(handlePrimarySubmit)}
                disabled={isLoading || roomImages.length === 0}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
