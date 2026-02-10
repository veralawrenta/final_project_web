"use client";
import { FormLabel } from "@/components/ui/form";
import { NewImageData } from "@/types/images";
import { AlertCircle, Star, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
interface CreateImageUploaderProps {
  images: NewImageData[];
  onImagesChange: (images: NewImageData[]) => void;
  maxImages?: number;
  label?: string;
  showCoverBadge?: boolean;
}

const CreateImageUploader = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = "Property Photos", 
  showCoverBadge = true,
}: CreateImageUploaderProps) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTouched, setIsTouched] = useState(false);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTouched(true);
    const files = e.target.files;

    if (!files) return;

    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages: NewImageData[] = [];
    let processedCount = 0;

    fileArray.forEach((file, index) => {
      
      if (file.size > 1 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 1MB per image`);
        processedCount++;
        return;
      }

      const allowedTypes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `${file.name} is not allowed. Only JPG, PNG, GIF, WEBP are supported`
        );
        processedCount++;
        return;
      }
      const reader = new FileReader();

      reader.onloadend = () => {
        newImages.push({
          preview: reader.result as string, 
          file: file,                       
          isCover: images.length === 0 && index === 0, 
        });
        
        processedCount++;
        if (processedCount === fileArray.length) {
          if (newImages.length > 0) {
            onImagesChange([...images, ...newImages]);
          }

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      
      reader.readAsDataURL(file);
    });
  };
 
  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const updatedImages = images.filter((_, i) => i !== index);

    if (imageToRemove.isCover && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
    }
    
    onImagesChange(updatedImages);
  };

  const setCoverImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isCover: i === index, // Only selected one is cover
    }));
    onImagesChange(updatedImages);
  };
  const remainingSlots = maxImages - images.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base font-semibold">
            {label}
          </FormLabel>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {images.length}/{maxImages} images
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          High-quality photos increase your booking conversion.
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
      {remainingSlots > 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload images</p>
          <p className="text-xs text-muted-foreground mt-1">
            Max 1MB per image • JPG, PNG, GIF, WEBP
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50">
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Maximum images reached ({maxImages}/{maxImages})
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Delete existing images to add more
          </p>
        </div>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              
              {/* Image Container */}
              <div
                className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${
                  img.isCover ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={img.preview}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {showCoverBadge && img.isCover && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-sm">
                  Cover
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                {showCoverBadge && !img.isCover && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(index)}
                    className="bg-background/90 hover:bg-background rounded-full p-1.5 shadow-lg"
                    title="Set as cover image"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all
                ${images.length === 0 && isTouched 
                  ? 'border-destructive bg-destructive/5' 
                  : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5'
                }
                ${images.length === 0 
                  ? 'col-span-2 md:col-span-4 py-16' 
                  : 'aspect-square'
                }
              `}
            >
              <Upload className={`mb-2 text-muted-foreground ${
                images.length === 0 ? 'h-8 w-8' : 'h-6 w-6'
              }`} />
              <span className="text-sm font-medium">Add Photos</span>
              {images.length === 0 && (
                <span className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF, JPEG (Max 1MB)
                </span>
              )}
            </button>
          )}
        </div>
      )}
      {isTouched && images.length === 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>At least one image is required to publish your listing</span>
        </div>
      )}
    </div>
  );
};

export default CreateImageUploader;