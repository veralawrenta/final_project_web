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
import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { registerSchemaTenant } from "../../lib/validator/auth.register-tenant.schema";


export function RegisterForTenantForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchemaTenant>>({
    resolver: zodResolver(registerSchemaTenant),
    defaultValues: { tenantName: "", email: "" },
  });

  const { mutateAsync: register, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof registerSchemaTenant>) => {
      const { data } = await axiosInstance.post("/auth/register/tenant", body);
      return data;
    },
    onSuccess: () => {
      toast.success("Register success. Check your email for verification");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });

  async function onSubmit(data: z.infer<typeof registerSchemaTenant>) {
    await register(data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="tenantName">
                  Tenant or Company Name
                </FieldLabel>
                <Input
                  id="tenantName"
                  type="tenantName"
                  placeholder="Enter your company or name here..."
                  required
                  {...form.register("tenantName")}
                />
              </Field>
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
                  className="font-bold text-white rounded-l-lg bg-cyan-600 hover:bg-slate-600"
                >
                  {isPending ? "Loading" : "Create Account"}
                </Button>
              </Field>
              <div className="flex flex-col gap-2 text-center">
                <FieldDescription>
                  Already have an account?{" "}
                  <a
                    href="/auth/login/tenant"
                    className="text-slate-700 hover:text-primary"
                  >
                    Sign in
                  </a>
                </FieldDescription>

                <FieldDescription>
                  Registering as User?{" "}
                  <a
                    href="/auth/register/user"
                    className="text-slate-700 hover:text-primary"
                  >
                    Register User
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
              src="https://images.unsplash.com/photo-1556020651-2da6df9dce9d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
