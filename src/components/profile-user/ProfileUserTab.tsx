"use client";

import React, { useEffect, useState } from "react";
import {
  useMeProfile,
  useResendVerification,
  useUpdateProfileUser,
  useUploadAvatar,
} from "@/hooks/useProfile";
import { updateDataUserSchema } from "@/lib/validator/profile.update-data.schema";

import { ProfileHeader } from "./profile-tab/ProfileHeader";
import { AvatarSection } from "./profile-tab/AvatarSection";
import { ProviderSection } from "./profile-tab/ProviderSection";
import { VerificationSection } from "./profile-tab/VerificationSection";
import { PersonalInfoSection } from "./profile-tab/PersonalInfoSection";

  type ProfileView = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  aboutMe: string;
  avatar?: string | null;
  provider?: "GOOGLE" | "CREDENTIAL";
  isVerified?: boolean;
};

const ProfileUserTab = () => {
  const { data: me, isPending } = useMeProfile();
  const updateProfile = useUpdateProfileUser();
  const resendVerification = useResendVerification();
  const uploadAvatar = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [formData, setFormData] = useState<ProfileView | null>(null);
  const [editData, setEditData] = useState<ProfileView | null>(null);

  console.log('Profile Debug:', {
    me,
    isPending,
    formData,
    editData
  });


  useEffect(() => {
    if (!me) return;

    const mapped: ProfileView = {
      firstName: me.firstName ?? "",
      lastName: me.lastName ?? "",
      email: me.email,
      phone: me.phone ?? "",
      address: me.address ?? "",
      aboutMe: me.aboutMe ?? "",
      avatar: me.avatar,
      provider: me.provider,
      isVerified: me.isVerified,
    };

    setFormData(mapped);
    setEditData(mapped);
  }, [me]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!formData || !editData) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(formData);
  };

  const handleSave = () => {
    const payload = updateDataUserSchema.parse(editData);
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setFormData(editData);
        setIsEditing(false);
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => prev && { ...prev, [name]: value });
  };

  const handleAvatarUpload = (file: File) => {
    setIsLoadingAvatar(true);
    uploadAvatar.mutate(file, {
      onSettled: () => setIsLoadingAvatar(false),
    });
  };

  return (
    <div className="space-y-6">
      <ProfileHeader />
      
      <AvatarSection
        avatar={formData.avatar}
        firstName={formData.firstName}
        lastName={formData.lastName}
        onUpload={handleAvatarUpload}
        isUploading={isLoadingAvatar}
      />

      <ProviderSection provider={formData.provider} />

      <VerificationSection
        isVerified={!!formData.isVerified}
        onResendVerification={() => resendVerification.mutate()}
      />

      <PersonalInfoSection
        isEditing={isEditing}
        formData={formData}
        editData={editData}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onInputChange={handleInputChange}
      />
    </div>
  );
};

export default ProfileUserTab;