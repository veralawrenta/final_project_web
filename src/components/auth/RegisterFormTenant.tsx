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
import { toast } from "react-toastify";
import z from "zod";
import { registerSchemaTenant } from "../../lib/validator/auth.register-tenant.schema";

export function RegisterFormTenant({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchemaTenant>>({
    resolver: zodResolver(registerSchemaTenant),
    defaultValues: { tenantName: "", email: "", role: "TENANT" },
  });

  const { mutateAsync: register, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof registerSchemaTenant>) => {
      const { data } = await axiosInstance.post("/auth/register/tenant", {
        tenantName: body.email,
        email: body.email,
        role: body.role,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Register success");
      router.push("/")
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
          <form id="form-register" className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Image
                  src={"/images/staynuit-name.png"}
                  width={200}
                  height={200}
                  alt="website logo"
                  loading="eager"
                  className="h-auto w-auto"
                ></Image>
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="tenantName" className="mt-4 px-2">
                  Tenant Name
                </FieldLabel>
                <Input
                  id="tenantName"
                  type="tenantName"
                  placeholder="Enter your name or company name here..."
                  {...form.register("tenantName")}
                  required
                />
                <FieldLabel htmlFor="email" className="mt-4 px-2">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email here..."
                  {...form.register("email")}
                  required
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  form="form-register"
                  disabled={isPending}
                  className="font-bold text-white rounded-l-lg"
                >
                  {isPending ? "Loading" : "Create Account"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <a href="/auth/login/tenant" className="text-primary">
                  Sign in
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/images/register-user.jpg"
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
