"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import { axiosInstance } from "@/lib/axios";
import { verifyAndSetPasswordSchema } from "../../lib/validator/auth.set-password.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import Image from "next/image";

type FormData = z.infer<typeof verifyAndSetPasswordSchema>;

const VerifyAndSetPasswordForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const verificationToken = params.get("verificationToken");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(verifyAndSetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!verificationToken) {
      setIsVerifying(false);
      setIsValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        await axiosInstance.post("/auth/validate", {
          verificationToken,
        });

        setIsValid(true);
      } catch {
        toast.error("Invalid or expired verification link");
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    validateToken();
  }, [verificationToken]);

  const onSubmit = async (data: FormData) => {
    if (!verificationToken) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.patch("/auth/set-password", {
        verificationToken,
        password: data.password,
      });

      toast.success("Your account has been verified successfully");

      const role = response.data.user.role;

      if (role === "USER") {
        router.replace("/auth/login/user");
      } else if (role === "TENANT") {
        router.replace("/auth/login/tenant");
      } else {
        router.replace("/");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ??
            "Failed to verify account. Please try again."
        );
        toast.error("Verification failed");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Validating your account. Please wait...
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-red-600">
            Your verification link is invalid or has expired.
          </p>
          <Link
            href="/auth/resend-verification"
            className="text-primary underline"
          >
            Resend verification email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-md">
        <div className="border-border border-2 rounded-2xl shadow-lg p-8 md:p-12 space-y-8 text-left">
          <div className="flex justify-center">
            <Image
              src={"/images/staynuit-name.png"}
              width={150}
              height={150}
              alt="website logo"
              loading="eager"
              className="h-auto w-auto"
            ></Image>
          </div>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-semibold">
              Set Your Password
            </h1>
            <p>One more step to become our verified member</p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                {...form.register("password")}
                disabled={isSubmitting}
              />
              <p className="text-sm text-red-600">
                {form.formState.errors.password?.message}
              </p>
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                {...form.register("confirmPassword")}
                disabled={isSubmitting}
              />
              <p className="text-sm text-red-600">
                {form.formState.errors.confirmPassword?.message}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12"
            >
              {isSubmitting ? "Setting Password…" : "Set Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAndSetPasswordForm;
