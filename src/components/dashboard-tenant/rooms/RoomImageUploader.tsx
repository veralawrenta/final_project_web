import { Upload, X } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { useRef } from "react";

interface RoomImageUploaderProps {
  images: string[];
  setImages: (value: string[]) => void;
  imageFiles: File[];
  setImageFiles: (value: File[]) => void;
  maxImages?: number;
}

const RoomImageUploader = ({
  images,
  setImages,
  imageFiles,
  setImageFiles,
  maxImages = 3,
}: RoomImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newPreviews: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      if (file.size > 1 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 1MB.`);
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(file.type)) {
        toast.error(`${file.name} is not a valid image.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImageFiles([...imageFiles, ...validFiles]);
    setImages([...images, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
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
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Click to upload images</p>
        <p className="text-xs text-muted-foreground mt-1">
          ({images.length}/{maxImages} images)
        </p>
      </div>

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
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
