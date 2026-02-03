import { Image, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';

interface PropertyImagesSectionProps {
  imageFiles: File[];
  imagePreviews: string[];
  onOpenModal: () => void;
};

export function PropertyImagesSection({
  imageFiles,
  imagePreviews,
  onOpenModal,
}: PropertyImagesSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>
          Property Images <span className="text-destructive">*</span>
        </FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenModal}
          className="gap-1"
        >
          <Image className="h-3.5 w-3.5" />
          {imageFiles.length > 0
            ? `${imageFiles.length}/5 Images`
            : 'Upload Images'}
        </Button>
      </div>

      {imagePreviews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imagePreviews.slice(0, 4).map((preview, index) => (
            <div
              key={index}
              className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border shrink-0 relative group"
            >
              <img
                src={preview}
                alt={`Property ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 0 && (
                <div className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground rounded px-1 py-0.5 text-[9px] font-medium flex items-center gap-0.5">
                  <Star className="h-2 w-2" /> Cover
                </div>
              )}
            </div>
          ))}
          {imageFiles.length > 4 && (
            <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
              <span className="text-xs text-muted-foreground">
                +{imageFiles.length - 4}
              </span>
            </div>
          )}
        </div>
      )}

      {imageFiles.length === 0 && (
        <p className="text-xs text-destructive">
          At least 1 image required (max 5)
        </p>
      )}
    </div>
  );
}