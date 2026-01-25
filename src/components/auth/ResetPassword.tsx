"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import z from "zod";
import { axiosInstance } from "../../lib/axios";
import { cn } from "../../lib/utils";
import { resetPasswordSchema } from "../../lib/validator/auth.reset-password.schema";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  verificationToken: string;
}

export function ResetPasswordForm({
  className,
  verificationToken,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutateAsync: resetPassword, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof resetPasswordSchema>) => {
      const { data } = await axiosInstance.patch("/auth/reset-password", body, {
        headers: { Authorization: `Bearer ${verificationToken}` },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Reset password success");
      router.push("/");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message ?? "Authentication failed";
    },
  });

  async function onSubmit(body: z.infer<typeof resetPasswordSchema>) {
    await resetPassword(body);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Toaster position="top-right" richColors />
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Image
                  src="/images/nuit-logo.png"
                  width={100}
                  height={100}
                  alt="Staynuit"
                  loading="eager"
                />
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter details to reset your password
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password here..."
                  required
                  {...form.register("password")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password here..."
                  required
                  {...form.register("confirmPassword")}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="font-bold text-white rounded-l-lg bg-blue-500 hover:bg-blue-600 w-full h-12"
                >
                  {isPending ? "Loading" : "Submit"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1589649541232-009ea118927b?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover bg-slate-600 dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
