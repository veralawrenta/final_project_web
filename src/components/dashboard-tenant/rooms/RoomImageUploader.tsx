import { Upload, X } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { useRef } from "react";

interface RoomImageUploaderProps {
  images: string[];
  imageFiles: File[];
  onImagesChange: (images: string[], files: File[]) => void;
  maxImages?: number;
}

const RoomImageUploader = ({
  images,
  imageFiles,
  onImagesChange,
  maxImages = 10,
}: RoomImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Check total images limit
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newPreviews: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    fileArray.forEach((file) => {
      // Check file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 1MB.`);
        return;
      }

      // Check file type
      if (!["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(file.type)) {
        toast.error(`${file.name} is not a valid image.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    // Update parent component state
    if (validFiles.length > 0) {
      const updatedImages = [...images, ...newPreviews];
      const updatedFiles = [...imageFiles, ...validFiles];
      onImagesChange(updatedImages, updatedFiles);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(images[index]);
    
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    onImagesChange(updatedImages, updatedFiles);
  };

  return (
    <div className="space-y-4">
      <FormLabel>Room Images *</FormLabel>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        disabled={maxImages === 0}
      />

      {/* Upload Area */}
      {maxImages > 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload images</p>
          <p className="text-xs text-muted-foreground mt-1">
            ({images.length}/{maxImages} images) • Max 1MB per image
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported: JPEG, PNG, GIF
          </p>
        </div>
      )}

      {maxImages === 0 && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50">
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Maximum images reached (10/10)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Delete existing images to add more
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={img}
                  alt={`Room image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Cover Badge - only for first image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  New Cover
                </div>
              )}
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomImageUploader;