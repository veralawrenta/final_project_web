"use client";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/price/currency";
import { roomsWithImageSchema } from "@/lib/validator/dashboard.rooms.schema";
import { NewImageData } from "@/types/images";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus, Plus, Star, Upload, X } from "lucide-react";
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
  showSecondaryAction = false,
  secondaryActionLabel = "Save & Add Another",
  onSecondaryAction,
  title = "Room Details",
  description = "Fill in the room information",
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
      basePrice: initialData?.basePrice || 100000,
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
      toast.error("Maximum 10 images");
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
      toast.error("Upload at least one image");
      return;
    }

    if (!data.description.trim() || data.description === "<p></p>") {
      toast.error("Description is required");
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Deluxe Ocean View" {...field} />
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
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Describe the room..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price/Night</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          Rp
                        </span>
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="100000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(field.value || 0)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementField("totalGuests", 1)}
                          disabled={field.value <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          className="text-center"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementField("totalGuests", 20)}
                          disabled={field.value >= 20}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
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
                    <FormLabel>Units</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => decrementField("totalUnits", 1)}
                          disabled={field.value <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          className="text-center"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => incrementField("totalUnits", 100)}
                          disabled={field.value >= 100}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <FormLabel>Room Images</FormLabel>
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
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium mb-1">Upload images</p>
                <p className="text-xs text-muted-foreground">
                  {roomImages.length}/10 images
                </p>
              </div>

              {roomImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {roomImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 border"
                    >
                      <img
                        src={img.preview}
                        alt={`Room ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {img.isCover && (
                        <Badge className="absolute top-1.5 left-1.5 text-xs gap-1" variant="default">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Cover
                        </Badge>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {!img.isCover && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImage(index);
                            }}
                            className="h-7 text-xs px-2"
                          >
                            <Star className="h-3 w-3" />
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
                          className="h-7 w-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {roomImages.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  At least one image is required
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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

              {showSecondaryAction && onSecondaryAction && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={form.handleSubmit(handleSecondarySubmit)}
                  disabled={isLoading || roomImages.length === 0}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Plus className="h-4 w-4 mr-2" />
                  {secondaryActionLabel}
                </Button>
              )}

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