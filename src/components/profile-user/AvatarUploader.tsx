import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Camera } from "lucide-react";

interface AvatarUploaderProps {
  currentAvatar?: string | null;
  firstName?: string;
  lastName?: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  firstName,
  lastName,
  onUpload,
  isUploading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "B";

    const firstInitial = firstName?.charAt(0) ?? "";
    const lastInitial = lastName?.charAt(0) ?? "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
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
            src={currentAvatar || "/placeholder.svg"}
            alt="Profile picture"
          />
          <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
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
        <p className="text-sm font-medium text-foreground mb-1">Upload Avatar</p>
        <p className="text-sm text-muted-foreground">
          JPG, JPEG, PNG or GIF (Max. 1MB)
        </p>
      </div>
    </div>
  );
};

export default AvatarUploader;