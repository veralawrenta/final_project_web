"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, X, Save, CheckCircle, XCircle } from "lucide-react";
import {
  useMeProfile,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, X, Save, CheckCircle, XCircle } from "lucide-react";
import {
  useMeProfile,
  useUpdateProfileTenant,
  useUploadAvatar,
} from "@/hooks/useProfile";
import AvatarUploader from "../profile-user/AvatarUploader";
import { updateDataTenantSchema } from "@/lib/validator/dashboard.update-data.schema";
import { Skeleton } from "../ui/skeleton";

type TenantProfileView = {
  tenantName: string;
  imageUrl?: string | null;
  bankNumber: string;
  bankName: string;
  address: string;
  aboutMe: string;
  address: string;
  aboutMe: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isVerified?: boolean;
};

const ProfileTenantTab = () => {
  const { data: me, isPending } = useMeProfile();
  const { data: me, isPending } = useMeProfile();
  const updateProfile = useUpdateProfileTenant();
  const uploadImage = useUploadAvatar();
  const uploadImage = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [formData, setFormData] = useState<TenantProfileView | null>(null);
  const [editData, setEditData] = useState<TenantProfileView | null>(null);

  useEffect(() => {
    if (!me || !me.tenant) return;
    if (!me || !me.tenant) return;

    const mapped: TenantProfileView = {
      tenantName: me.tenant.tenantName ?? "",
      bankNumber: me.tenant.bankNumber ?? "",
      bankName: me.tenant.bankName ?? "",
      firstName: me.firstName ?? "",
      lastName: me.lastName ?? "",
      email: me.email,
      phone: me.phone ?? "",
      isVerified: me.isVerified,
      imageUrl: me.avatar ?? "",
      address: me.address ?? "",
      aboutMe: me.aboutMe ?? "",
      tenantName: me.tenant.tenantName ?? "",
      bankNumber: me.tenant.bankNumber ?? "",
      bankName: me.tenant.bankName ?? "",
      firstName: me.firstName ?? "",
      lastName: me.lastName ?? "",
      email: me.email,
      phone: me.phone ?? "",
      isVerified: me.isVerified,
      imageUrl: me.avatar ?? "",
      address: me.address ?? "",
      aboutMe: me.aboutMe ?? "",
    };

    setFormData(mapped);
    setEditData(mapped);
  }, [me]);
  }, [me]);

  if (isPending) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
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
    const payload = updateDataTenantSchema.parse(editData);
    const payload = updateDataTenantSchema.parse(editData);
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Tenant Profile</h1>
        <p className="text-muted-foreground">
          Manage your business information
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUploader
            currentAvatar={formData.imageUrl}
            firstName={formData.tenantName}
            lastName=""
            onUpload={handleImageUpload}
            isUploading={isLoadingImage}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Your complete business information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={formData.isVerified ? "default" : "secondary"}>
                {formData.isVerified ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Unverified
                  </>
                )}
              </Badge>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Business Details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Business Name</Label>
                {isEditing ? (
                  <Input
                    id="tenantName"
                    name="tenantName"
                    value={editData.tenantName}
                    onChange={handleInputChange}
                    placeholder="Enter business name"
                  />
                ) : (
                  <p className="text-sm">{formData.tenantName || "-"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm">{formData.phone || "-"}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  name="address"
                  value={editData.address}
                  onChange={handleInputChange}
                  placeholder="Enter business address"
                />
              ) : (
                <p className="text-sm">{formData.address || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutMe">About Business</Label>
              {isEditing ? (
                <Textarea
                  id="aboutMe"
                  name="aboutMe"
                  value={editData.aboutMe}
                  onChange={handleInputChange}
                  placeholder="Describe your business..."
                  rows={4}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {formData.aboutMe || "-"}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-6" />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Payment Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                {isEditing ? (
                  <Input
                    id="bankName"
                    name="bankName"
                    value={editData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g., Bank Central Asia"
                  />
                ) : (
                  <p className="text-sm">{formData.bankName || "-"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankNumber">Account Number</Label>
                {isEditing ? (
                  <Input
                    id="bankNumber"
                    name="bankNumber"
                    value={editData.bankNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                  />
                ) : (
                  <p className="text-sm font-mono">
                    {formData.bankNumber || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6" />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Account Owner
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-sm">{formData.firstName || "-"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-sm">{formData.lastName || "-"}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ProfileTenantTab;
