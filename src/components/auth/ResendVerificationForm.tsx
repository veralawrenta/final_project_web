"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { axiosInstance } from "../../lib/axios";
import { cn } from "../../lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resendVerificationSchema } from "../../lib/validator/auth.resend-verification.schema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export function ResendVerificationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof resendVerificationSchema>>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
  });

  const { mutateAsync: resendVerification, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof resendVerificationSchema>) => {
      const { data } = await axiosInstance.post(
        "/auth/resend-verification",
        body
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Verification Sent", {
        description: "Please check your inbox (and spam) for the link.",
      });
      setTimeout(() => router.push("/"), 2000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to send verification email.";
      toast.error("Process Failed", { description: message });
    },
  });

  async function onSubmit(values: z.infer<typeof resendVerificationSchema>) {
    const toastId: string | number = toast.loading("Sending verification link...");
    try {
      await resendVerification(values);
      toast.dismiss(toastId);
    } catch (err) {
      toast.dismiss(toastId);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Toaster position="top-center" richColors />
      <Card className="overflow-hidden p-0 border-slate-200 shadow-xl rounded-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-12">
            <FieldGroup className="space-y-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Image
                  src="/images/nuit-logo.png"
                  width={64}
                  height={64}
                  alt="Staynuit logo"
                  loading="eager"
                  className="h-auto w-auto"
                />
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verify Email Address</h1>
                  <p className="text-slate-500 text-sm">
                    Enter your email to receive a new verification link
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="email" className="text-slate-700 font-medium">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-11 border-slate-200 focus-visible:ring-blue-200"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </Field>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#C7E1FB] hover:bg-[#B4D3F5] text-[#1E293B] font-bold transition-all"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </span>
                  ) : (
                    "Send Verification Link"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
          
          <div className="relative hidden md:block bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1761920555057-54bbc392135c?q=80&w=1974&auto=format&fit=crop"
              alt="Staynuit hospitality"
              className="absolute inset-0 h-full w-full object-cover grayscale-[0.2] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-[#334155]/10 mix-blend-multiply" />
          </div>
        </CardContent>
      </Card>
      
      <FieldDescription className="px-6 text-center text-slate-400 text-xs">
        By clicking continue, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a>{" "}
        and <a href="/" className="underline hover:text-slate-600">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}