import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarUploader from '../AvatarUploader';

interface AvatarSectionProps {
  avatar?: string | null;
  firstName: string;
  lastName: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  avatar,
  firstName,
  lastName,
  onUpload,
  isUploading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent>
        <AvatarUploader
          currentAvatar={avatar}
          firstName={firstName}
          lastName={lastName}
          onUpload={onUpload}
          isUploading={isUploading}
        />
      </CardContent>
    </Card>
  );
};