"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormLabel } from "@/components/ui/form";
import { ExistingImageData, NewImageData } from "@/types/images";
import { AlertCircle, Star, Trash2, Upload, X } from "lucide-react";
import React, { useRef } from "react";
import { toast } from "sonner";

interface EditImageUploaderProps {
  existingImages: ExistingImageData[];
  newImages: NewImageData[];
  onExistingImagesChange: (images: ExistingImageData[]) => void;
  onNewImagesChange: (images: NewImageData[]) => void;
  onDeleteExisting: (imageId: number) => void;
  maxImages?: number;
  isPublished: boolean;
}

const EditImageUploader = ({
  existingImages,
  newImages,
  onExistingImagesChange,
  onNewImagesChange,
  onDeleteExisting,
  maxImages = 10,
  isPublished = false,
}: EditImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  //we calculate total of images
  const totalImages = existingImages.length + newImages.length;
  const remainingSlots = maxImages - totalImages;
  const isLastImage = totalImages === 1;
  const showWarning = isPublished && isLastImage;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    if (totalImages + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
    }

    const newImagesList: NewImageData[] = [];
    let processedCount = 0;

    fileArray.forEach((file, index) => {
      if (file.size > 1 * 1024 * 1024) {
        toast.error(`{file.name} is too large. Max 1MB per image`);
        processedCount++;
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format.`);
        processedCount++;
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        newImagesList.push({
          preview: reader.result as string,
          file: file,
          isCover: totalImages === 0 && index === 0,
        });

        processedCount++;

        if (processedCount === fileArray.length) {
          if (newImagesList.length > 0) {
            onNewImagesChange([...newImages, ...newImagesList]);
          }

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const deleteExistingImage = (id: number) => {
    if (isPublished && isLastImage) {
      toast.error("Published property must have at least one image", {
        description: "Upload a new image before deleting this one",
        duration: 5000,
      });
      return;
    }
    const imageToDelete = existingImages.find((img) => img.id === id);
    if (!imageToDelete) return;

    const updated = existingImages.filter((img) => img.id !== id);

    if (imageToDelete.isCover) {
      if (updated.length > 0) {
        updated[0].isCover = true;
      } else if (newImages.length > 0) {
        const updatedNew = [...newImages];
        updatedNew[0].isCover = true;
        onNewImagesChange(updatedNew);
      }
    }

    onExistingImagesChange(updated);
    onDeleteExisting(id);
  };

  const removeNewImage = (index: number) => {
    if (isPublished && isLastImage) {
      toast.error("Published property must have at least one image", {
        description: "Upload another image before deleting this one",
        duration: 5000,
      });
      return;
    }

    const imageToRemove = newImages[index];
    const updated = newImages.filter((_, i) => i !== index);

    if (imageToRemove.isCover) {
      if (updated.length > 0) {
        updated[0].isCover = true;
      } else if (existingImages.length > 0) {
        const updatedExisting = [...existingImages];
        updatedExisting[0].isCover = true;
        onExistingImagesChange(updatedExisting);
      }
    }

    onNewImagesChange(updated);
  };
  const setCoverExisting = (id: number) => {
    const updatedExisting = existingImages.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    const updatedNew = newImages.map((img) => ({ ...img, isCover: false }));

    onExistingImagesChange(updatedExisting);
    onNewImagesChange(updatedNew);
  };

  const setCoverNew = (index: number) => {
    const updatedExisting = existingImages.map((img) => ({
      ...img,
      isCover: false,
    }));
    const updatedNew = newImages.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));

    onExistingImagesChange(updatedExisting);
    onNewImagesChange(updatedNew);
  };
  return (
    <div className="space-y-4">
      {/* Header with image count */}
      <div className="flex items-center justify-between">
        <FormLabel>Property Images *</FormLabel>
        <span className="text-xs text-muted-foreground">
          {totalImages}/{maxImages} images
        </span>
      </div>

      {/* Warning Alert - Only show if published and only 1 image */}
      {showWarning && (
        <Alert
          variant="destructive"
          className="border-destructive bg-destructive/10"
        >
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            This is a <strong>published property</strong>. You must keep at
            least one image. Upload a new image before deleting this one.
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Upload Area */}
      {remainingSlots > 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/10"
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload images
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max 1MB per image • JPEG, PNG, GIF, WEBP
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50">
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Maximum images reached
          </p>
        </div>
      )}

      {/* Images Grid */}
      {totalImages > 0 && (
        <div className="space-y-4">
          {/* SECTION 1: Existing Images (already on server) */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Current Images
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {existingImages.map((img) => {
                  // Can we delete this image?
                  const canDelete = !(isPublished && isLastImage);

                  return (
                    <div key={img.id} className="relative group">
                      {/* Image */}
                      <div
                        className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${
                          img.isCover
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="Property"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Cover badge */}
                      {img.isCover && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg font-medium">
                          Cover
                        </div>
                      )}

                      {/* Action buttons (show on hover) */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Set as cover button */}
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverExisting(img.id)}
                            className="bg-background/95 hover:bg-background rounded-full p-1.5 shadow-lg"
                            title="Set as cover"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => deleteExistingImage(img.id)}
                          disabled={!canDelete}
                          className={`rounded-full p-1.5 shadow-lg ${
                            canDelete
                              ? "bg-destructive text-destructive-foreground hover:scale-110"
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                          title={
                            canDelete ? "Delete" : "Cannot delete last image"
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {newImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                New Images (Not Saved Yet)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {newImages.map((img, index) => {
                  // Can we delete this image?
                  const canDelete = !(isPublished && isLastImage);

                  return (
                    <div key={index} className="relative group">
                      {/* Image with dashed border to show it's new */}
                      <div
                        className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${
                          img.isCover
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border border-dashed"
                        }`}
                      >
                        <img
                          src={img.preview}
                          alt="New"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Cover badge */}
                      {img.isCover && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg font-medium">
                          Cover
                        </div>
                      )}

                      {/* "New" badge */}
                      <div className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded shadow-sm font-medium">
                        New
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverNew(index)}
                            className="bg-background/95 hover:bg-background rounded-full p-1.5 shadow-lg"
                            title="Set as cover"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          disabled={!canDelete}
                          className={`rounded-full p-1.5 shadow-lg ${
                            canDelete
                              ? "bg-destructive text-destructive-foreground hover:scale-110"
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                          title={
                            canDelete ? "Remove" : "Cannot delete last image"
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {totalImages === 0 && (
        <p className="text-sm text-destructive">
          At least one image is required
        </p>
      )}
    </div>
  );
};

export default EditImageUploader;
