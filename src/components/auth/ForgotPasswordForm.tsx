"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { forgotPasswordSchema } from "../schema";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { mutateAsync: forgotPassword, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof forgotPasswordSchema>) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", body);
      return data;
    },
    onSuccess: () => {
      toast.success("send forgot password success, please check your email");
    },
    onError: () => {
      toast.error("send forgot password failed");
      router.push("/")
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    await forgotPassword(values);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold text-blue-800">Forgot Password</h1>
            <p className="text-base text-zinc-700 leading-tight">
              No worries. We will send you reset instruction
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email here..."
              required
              {...form.register("email")}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isPending} className="w-full h-12">
              {isPending ? "Submitting…" : "Submit"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center mb-2">
        By clicking continue, you agree to our <a href="/">Terms of Service</a>{" "}
        and <a href="/">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
