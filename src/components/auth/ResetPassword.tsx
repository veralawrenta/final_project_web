"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { resetPasswordSchema } from "../schema";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { toast } from "react-toastify"; 
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  verificationToken: string;
}

export function ResetPasswordForm({
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutateAsync: resetPassword, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof resetPasswordSchema>) => {
      const { data } = await axiosInstance.patch(
        "/auth/reset-password",
        body, 
        {
          headers: {
            Authorization: `Bearer ${props.verificationToken}`,
          },
        }
      )
      return data;
    },
    onSuccess: () => {
      toast.success("reset password success");
      router.push("/")
      
    },
    onError: () => {
      toast.error("reset password failed");
      router.push("/error")
    },
  });

  async function onSubmit(body: z.infer<typeof resetPasswordSchema>) {
    await resetPassword(body);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your password to confirm</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password here."
                  required
                  {...form.register("password")}
                />
              </Field>
              <Field>
                <Field>
                  <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Confirm your new password here."
                    required
                    {...form.register("confirmPassword")}
                  />
                </Field>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="font-bold"
                >
                  {isPending ? "Loading" : "Submit"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
