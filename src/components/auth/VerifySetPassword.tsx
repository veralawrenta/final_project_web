"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { verifyAndSetPasswordSchema } from "../../lib/validator/auth.set-password.schema";
import { Role } from "@/types/user";

type FormData = z.infer<typeof verifyAndSetPasswordSchema>;

const VerifyAndSetPasswordForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const verificationToken = params.get("token");

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
        await axiosInstance.post("/auth/validate", null, {
          headers: {
            Authorization: `Bearer ${verificationToken}`,
          },
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
      const response = await axiosInstance.patch(
        "/auth/set-password",
        {
          password: data.password,
        },
        {
          headers: {
            Authorization: `Bearer ${verificationToken}`,
          },
        }
      );

      toast.success("Your account has been verified successfully");

      const role = response.data.user.role;

      if (role === Role.USER) {
        router.push("/auth/login/user");
      } else if (role === Role.TENANT) {
        router.push("/auth/login/tenant");
      } else {
        router.replace("/");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ??
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-24 w-24 animate-pulse">
            <Image
              src="/images/nuit-logo.png"
              fill
              alt="Loading..."
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 animate-in fade-in duration-700">
              Validating your account...
            </p>
          </div>
        </div>
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
        <div className="border-slate-300 border-2 rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 space-y-8 text-left">
          <div className="flex justify-center">
            <Image
              src={"/images/nuit-logo.png"}
              width={150}
              height={150}
              alt="website logo"
              loading="eager"
              className="h-auto w-auto"
            ></Image>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
              Set Your Password
            </h1>
            <p className="text-slate-500 text-sm">
              One more step to become our verified member
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700 ml-1">
                Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-11 border-slate-200 focus-visible:ring-[#C7E1FB] rounded-xl"
                {...form.register("password")}
                disabled={isSubmitting}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password?.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700 ml-1">
                Confirm Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-11 border-slate-200 focus-visible:ring-[#C7E1FB] rounded-xl"
                {...form.register("confirmPassword")}
                disabled={isSubmitting}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.confirmPassword?.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-slate-600 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
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
