import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, X } from "lucide-react";

interface PersonalInfoSectionProps {
  isEditing: boolean;
  isSubmitting: boolean;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    aboutMe: string;
  };
  editData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    aboutMe: string;
  };
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  isEditing,
  isSubmitting = false,
  formData,
  editData,
  onEdit,
  onCancel,
  onSave,
  onInputChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={onEdit} size="sm">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <InfoField label="First Name" value={formData.firstName} />
            <InfoField label="Last Name" value={formData.lastName} />
            <InfoField label="Email" value={formData.email} />
            <InfoField label="Phone" value={formData.phone} />
            <InfoField label="Address" value={formData.address} />
            <InfoField label="About Me" value={formData.aboutMe} />
          </div>
        ) : (
          <div className="space-y-4">
            <InputField
              id="firstName"
              label="First Name"
              value={editData.firstName}
              onChange={onInputChange}
            />
            <InputField
              id="lastName"
              label="Last Name"
              value={editData.lastName}
              onChange={onInputChange}
            />
            <InputField
              id="phone"
              label="Phone"
              value={editData.phone}
              onChange={onInputChange}
            />
            <InputField
              id="address"
              label="Address"
              value={editData.address}
              onChange={onInputChange}
            />
            <TextAreaField
              id="aboutMe"
              label="Bio"
              value={editData.aboutMe}
              onChange={onInputChange}
            />
            <div className="flex gap-3 pt-2">
              <Button onClick={onSave} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button onClick={onCancel} variant="outline" disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <Label className="text-muted-foreground text-xs">{label}</Label>
    <p className="text-foreground font-medium">{value || "-"}</p>
  </div>
);

const InputField = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="mt-1"
    />
  </div>
);

const TextAreaField = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
      rows={3}
    />
  </div>
);
