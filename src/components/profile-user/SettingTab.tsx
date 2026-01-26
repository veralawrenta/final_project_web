"use client";
import {
  useChangeEmail,
  useChangePassword,
  useMeProfile,
} from "@/hooks/useProfile";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";

const SettingTabComponent = () => {
  const { data: profile, isPending } = useMeProfile();
  const { data: session } = useSession();
  const changeEmail = useChangeEmail();
  const changePassword = useChangePassword();

  //kamu mau buka tab yg mana defaultnya
  const [activeTab, setActiveTab] = useState<"password" | "email">("password");

  const [emailForm, setEmailForm] = useState({
    currentEmail: profile?.email,
    newEmail: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
  });

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    changeEmail.mutate({
      newEmail: emailForm.newEmail,
    });
  };

  const isGoogleUser = session?.user.provider === "GOOGLE";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Setting</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      {isGoogleUser && (
        <div className="p-4 rounded-md bg-primary border border-border text-primary-foreground text-sm">
          <p className="font-medium">
            Not allowed to use Settings. You are registered with Google,
            password and email are managed through your Google account settings
          </p>
        </div>
      )}

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            isGoogleUser
              ? "text-muted-foreground cursor-not-allowed"
              : activeTab === "password"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          disabled={isGoogleUser}
        >
          Change Password
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            isGoogleUser
              ? "text-muted-foreground cursor-not-allowed"
              : activeTab === "email"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          disabled={isGoogleUser}
        >
          Change Email
        </button>
      </div>

      {activeTab === "password" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              {" "}
              Update your password to keep your account secure{" "}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGoogleUser ? (
              <div className="p-4 rounded-md bg-muted text-muted-foreground text-sm text-center">
                <p className="font-medium mb-1">
                  Password changes not available
                </p>
                <p>
                  Your account is managed through Google. Please change your
                  password through your Google account settings.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-4 max-w-md"
              >
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword.currentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          currentPassword: !prev.currentPassword,
                        }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword.currentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.newPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                </div>
                <Button type="submit" disabled={isPending} className="bg-slate-600 hover:bg-primary">
                  {isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
      {activeTab === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Email Address</CardTitle>
            <CardDescription>Update your email address</CardDescription>
          </CardHeader>
          <CardContent>
            {isGoogleUser ? (
              <div className="p-4 rounded-md bg-muted text-muted-foreground text-sm text-center">
                <p className="font-medium mb-1">Email changes not available</p>
                <p>
                  Your account is managed through Google. Please change your
                  email through your Google account settings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="currentEmail">Current Email</Label>
                  <Input
                    id="currentEmail"
                    type="email"
                    value={emailForm.currentEmail}
                    disabled
                    className="mt-1 bg-muted text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your current email address cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    value={emailForm.newEmail}
                    onChange={handleEmailInputChange}
                    placeholder="Enter your new email address"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isPending} className="bg-slate-600 hover:bg-primary">
                  {isPending ? "Processing..." : "Update Email"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingTabComponent;
