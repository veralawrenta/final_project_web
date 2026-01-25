import { axiosInstance } from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner';

const VerifyChangeEmailForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const verificationToken = params.get("verificationToken");

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!verificationToken) {
      setIsVerifying(false);
      return;
    };

    const validateToken = async () => {
      try {
        const { data } = await axiosInstance.post(`/auth/verify-change-email/${verificationToken}`, {
          verificationToken,
         });
         const role = data.user.role;
         toast.success("Account verified successfully");

        if (role === "TENANT") {
          router.replace("/dashboard/tenant");
        } else {
          router.replace("/profile/user");
        };
      } catch {
         toast.error("Invalid or expired verification link");
         router.replace("/auth/resend-verification");
      } finally {
        setIsVerifying(false);
      };
    };
    validateToken();
  }, [verificationToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Toaster position="top-right" richColors />
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
};

export default VerifyChangeEmailForm