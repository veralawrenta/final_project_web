"use client";
import { useRouter } from "next/navigation";
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
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import z from "zod";
import { registerSchemaCredentials } from "../../lib/validator/auth.register-user.schema";
import ButtonGoogle from "../google/ButtonGoogle";
import { Card, CardContent } from "../ui/card";

export function RegisterForUserForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchemaCredentials>>({
    resolver: zodResolver(registerSchemaCredentials),
    defaultValues: { email: "" },
  });

  const { mutateAsync: register, isPending } = useMutation({
    mutationFn: async (
      body: z.infer<typeof registerSchemaCredentials>
    ) => {
      const { data } = await axiosInstance.post("/auth/register/user", body);
      return data;
    },
    onSuccess: () => {
      toast.success("Register success");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchemaCredentials>) {
    await register(data);
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
                <h1 className="text-2xl font-bold">
                  Create your nuiter account
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
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
                <Button
                  type="submit"
                  disabled={isPending}
                  className="font-bold text-white rounded-l-lg bg-slate-600 hover:bg-primary"
                >
                  {isPending ? "Loading" : "Create Account"}
                </Button>
                <FieldSeparator>Or</FieldSeparator>
                <Field>
                  <ButtonGoogle />
                </Field>
              </Field>
              <div className="flex flex-col gap-2 text-center">
                <FieldDescription>
                  Already have an account?{" "}
                  <a
                    href="/auth/login/user"
                    className="text-slate-700 hover:text-primary"
                  >
                    Sign in
                  </a>
                </FieldDescription>

                <FieldDescription>
                  Registering as Tenant?{" "}
                  <a
                    href="/auth/register/tenant"
                    className="text-slate-700 hover:text-primary"
                  >
                    Register Tenant
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
