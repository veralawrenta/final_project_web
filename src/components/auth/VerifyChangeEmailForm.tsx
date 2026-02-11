"use client";
import { axiosInstance } from "@/lib/axios";
import { Role } from "@/types/user";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const VerifyChangeEmailForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const { data: session } = useSession();

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setError("No verification token provided");
      return;
    }

    const validateToken = async () => {
      try {
        const response = await axiosInstance.patch(
          "/auth/verify-change-email",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const user = response.data?.user;

        toast.success("Account verified successfully");

        if (user && user.role === "TENANT") {
          router.replace("/dashboard/tenant");
        } else {
          router.replace("/profile/user");
        }
      } catch (err) {
        console.error(err);
        setError("Invalid or expired verification link");
        toast.error("Verification failed");
      } finally {
        setIsVerifying(false);
      }
    };

    validateToken();
  }, [token, router]);

  if (isVerifying) {
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
          <p className="text-sm text-muted-foreground">
            Verifying your account…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const returnLink =
      session?.user?.role === Role.TENANT
        ? "/dashboard/tenant"
        : "/profile/user";

        const returnText = session?.user?.role === Role.TENANT
      ? "Return to Dashboard"
      : "Return to Profile";

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
          <h2 className="text-xl font-semibold text-red-600">
            Verification Failed
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Link
            href={returnLink}
            className="inline-block text-primary hover:underline"
          >
            {returnText}
          </Link>
        </div>
      </div>
    );
  }
  return null;
};

export default VerifyChangeEmailForm;
