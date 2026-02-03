"use client";
import React, { useEffect, useState } from "react";
import {
  useMeProfile,
  useUpdateProfileUser,
  useUploadAvatar,
} from "@/hooks/useProfile";
import { updateDataUserSchema } from "@/lib/validator/profile.update-data.schema";
import { AvatarSection } from "./profile-tab/AvatarSection";
import { PersonalInfoSection } from "./profile-tab/PersonalInfoSection";
import { ProfileHeader } from "./profile-tab/ProfileHeader";
import { ProviderSection } from "./profile-tab/ProviderSection";
import { VerificationSection } from "./profile-tab/VerificationSection";
import { Skeleton } from "../ui/skeleton";

type UserProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  aboutMe: string;
  avatar?: string | null;
  provider?: "CREDENTIAL" | "GOOGLE";
  isVerified: boolean | undefined;
};

const ProfileUserTab = () => {
  const { data: me, isPending } = useMeProfile();
  const updateProfile = useUpdateProfileUser();
  const uploadAvatar = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [formData, setFormData] = useState<UserProfileForm | null>(null);
  const [editData, setEditData] = useState<UserProfileForm | null>(null);

  useEffect(() => {
    if (!me) return;

    const mapped: UserProfileForm = {
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
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-4 p-4 border rounded-xl">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-xl space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
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

      <VerificationSection isVerified={!!formData.isVerified} />

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
