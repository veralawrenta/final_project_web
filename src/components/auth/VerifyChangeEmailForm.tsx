"use client";
import { axiosInstance } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const VerifyChangeEmailForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        const { data } = await axiosInstance.patch(
          "/auth/verify-change-email",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Account verified successfully");

        if (data.user.role === "TENANT") {
          router.replace("/dashboard/tenant");
        } else {
          router.replace("/profile/user");
        }
      } catch (err) {
        console.error(err);
        toast.error("Invalid or expired verification link");
        router.replace("/profile/user");
      } finally {
        setIsVerifying(false);
      }
    };

    validateToken();
  }, [token, router]);

  if (!isVerifying) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/images/nuit-logo.png"
          width={120}
          height={120}
          alt="Logo"
          priority
        />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your account…</p>
      </div>
    </div>
  );
};

export default VerifyChangeEmailForm;
