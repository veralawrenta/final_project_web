"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { loginSchema } from "../../lib/validator/auth.login.schema";
import { toast, Toaster } from "sonner";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function LoginForTenantForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof loginSchema>) => {
      const { data } = await axiosInstance.post("auth/login", body);
      return data;
    },
    onSuccess: async (data) => {
      await signIn("credentials", {
        redirect: false,
        ...data,
      });
      toast.success("Login success. Welcome Tenant!");
      setTimeout(() => {
        router.push("/dashboard/tenant");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
  async function onSubmit(data: z.infer<typeof loginSchema>) {
    await login(data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-slate-200 shadow-xl rounded-2xl bg-white">
        <CardContent className="grid p-0 md:grid-cols-2 ">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Image
                  src="/images/nuit-logo.png"
                  width={100}
                  height={100}
                  alt="Staynuit"
                  loading="eager"
                />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back Property Owner!
                </h1>
                <p className="text-slate-500 text-sm">Login Here</p>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  {...form.register("password")}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-cyan-600 hover:bg-slate-600 text-white font-bold transition-all active:scale-[0.98]"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>
              <div className="flex flex-col gap-2 text-center">
                <FieldDescription>
                  Don&apos;t have an account?{" "}
                  <a
                    href="/auth/register/tenant"
                    className="text-slate-700 hover:text-primary"
                  >
                    Register
                  </a>
                </FieldDescription>

                <FieldDescription>
                  Registered as User?{" "}
                  <a
                    href="/auth/login/user"
                    className="text-slate-700 hover:text-primary"
                  >
                    Login User
                  </a>
                </FieldDescription>

                <FieldDescription>
                  Have an account, not verified?{" "}
                  <a
                    href="/auth/resend-verification"
                    className="text-slate-700 hover:text-primary"
                  >
                    Resend Verification
                  </a>
                </FieldDescription>
              </div>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1540280369237-dea08361593a?q=80&w=1974&auto=format&fit=crop"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
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
