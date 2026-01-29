"use client";

import React, { useEffect, useState } from "react";
import {
  useMeTenantProfile,
  useUpdateProfileTenant,
  useUploadTenantImage,
} from "@/hooks/useTenantProfile";
import { updateTenantDataSchema } from "@/lib/validator/tenant.update-data.schema";

import { TenantProfileHeader } from "./tenant-profile-tab/TenantProfileHeader";
import { TenantImageSection } from "./tenant-profile-tab/TenantImageSection";
import { TenantInfoSection } from "./tenant-profile-tab/TenantInfoSection";
import { BankDetailsSection } from "./tenant-profile-tab/BankDetailsSection";
import { OwnerInfoSection } from "./tenant-profile-tab/OwnerInfoSection";

type TenantProfileView = {
  // Tenant specific fields
  tenantName: string;
  imageUrl?: string | null;
  bankNumber: string;
  bankName: string;
  
  // Owner (User) fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  aboutMe: string;
  avatar?: string | null;
  isVerified?: boolean;
};

const ProfileTenantTab = () => {
  const { data: tenantData, isPending } = useMeTenantProfile();
  const updateProfile = useUpdateProfileTenant();
  const uploadImage = useUploadTenantImage();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [formData, setFormData] = useState<TenantProfileView | null>(null);
  const [editData, setEditData] = useState<TenantProfileView | null>(null);

  console.log('Tenant Profile Debug:', {
    tenantData,
    isPending,
    formData,
    editData
  });

  useEffect(() => {
    if (!tenantData || !tenantData.user) return;

    const mapped: TenantProfileView = {
      // Tenant fields
      tenantName: tenantData.tenantName ?? "",
      imageUrl: tenantData.imageUrl,
      bankNumber: tenantData.bankNumber ?? "",
      bankName: tenantData.bankName ?? "",
      
      // User fields
      firstName: tenantData.user.firstName ?? "",
      lastName: tenantData.user.lastName ?? "",
      email: tenantData.user.email,
      phone: tenantData.user.phone ?? "",
      address: tenantData.user.address ?? "",
      aboutMe: tenantData.user.aboutMe ?? "",
      avatar: tenantData.user.avatar,
      isVerified: tenantData.user.isVerified,
    };

    setFormData(mapped);
    setEditData(mapped);
  }, [tenantData]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tenant profile...</p>
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
    const payload = updateTenantDataSchema.parse(editData);
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

  const handleImageUpload = (file: File) => {
    setIsLoadingImage(true);
    uploadImage.mutate(file, {
      onSettled: () => setIsLoadingImage(false),
    });
  };

  return (
    <div className="space-y-6">
      <TenantProfileHeader />
      
      <TenantImageSection
        imageUrl={formData.imageUrl}
        tenantName={formData.tenantName}
        onUpload={handleImageUpload}
        isUploading={isLoadingImage}
      />

      <TenantInfoSection
        isEditing={isEditing}
        formData={formData}
        editData={editData}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onInputChange={handleInputChange}
      />

      <BankDetailsSection
        isEditing={isEditing}
        formData={formData}
        editData={editData}
        onInputChange={handleInputChange}
      />

      <OwnerInfoSection
        firstName={formData.firstName}
        lastName={formData.lastName}
        email={formData.email}
        phone={formData.phone}
        avatar={formData.avatar}
        isVerified={formData.isVerified}
      />
    </div>
  );
};

export default ProfileTenantTab;
