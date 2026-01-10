"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { resendVerificationSchema } from "../../lib/validator/auth.resend-verification.schema";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
        body,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("send email verification success");
    },
    onError: () => {
      toast.error("send email verification failed");
    },
  });

  async function onSubmit(values: z.infer<typeof resendVerificationSchema>) {
    await resendVerification(values);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Image
                  src={"/images/staynuit-name.png"}
                  width={100}
                  height={100}
                  alt="website logo"
                  loading="eager"
                  className="h-auto w-auto"
                ></Image>
                <h1 className="text-2xl font-bold">Verify Email Address</h1>
                <p className="text-muted-foreground text-balance">
                  Have not yet verified? Please fill your email to verify
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email here..."
                  required
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  form="form-login"
                  disabled={isPending}
                  className="font-bold"
                >
                  {isPending ? "Loading" : "Submit"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1761920555057-54bbc392135c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="/">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
