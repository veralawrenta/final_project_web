// components/property/property-images-modal.tsx

import { useRef } from 'react';
import { Upload, X, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PropertyImagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFiles: File[];
  imagePreviews: string[];
  onImagesChange: (files: File[], previews: string[]) => void;
}

export function PropertyImagesModal({
  open,
  onOpenChange,
  imageFiles,
  imagePreviews,
  onImagesChange,
}: PropertyImagesModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 property images allowed');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          onImagesChange(newFiles, newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    onImagesChange(newFiles, newPreviews);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Property Images</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload 1-5 images. First image will be the cover photo.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload images
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, GIF (max 1MB each) • {imageFiles.length}/5
            </p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                    <img
                      src={preview}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5" /> Cover
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}