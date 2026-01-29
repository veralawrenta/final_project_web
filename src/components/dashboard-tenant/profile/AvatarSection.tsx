import { Camera, Building2 } from "lucide-react";
import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

interface TenantImageUploaderProps {
  currentImage?: string | null;
  tenantName?: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

const TenantImageUploader: React.FC<TenantImageUploaderProps> = ({
  currentImage,
  tenantName,
  onUpload,
  isUploading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = (tenantName?: string): string => {
    if (!tenantName) return "TN";
    return tenantName.charAt(0).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUpload(file);
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={currentImage || "/placeholder.svg"}
            alt="Business logo"
          />
          <AvatarFallback>
            {currentImage ? (<Building2 className="w-12 h-12" /> ) : ( getInitials(tenantName))}
          </AvatarFallback>
        </Avatar>

        <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
          <Camera className="w-4 h-4" />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-foreground mb-1">Upload Logo</p>
        <p className="text-sm text-muted-foreground">
          JPG, JPEG, PNG or GIF (Max. 1MB)
        </p>
      </div>
    </div>
  );
};

export default TenantImageUploader;
