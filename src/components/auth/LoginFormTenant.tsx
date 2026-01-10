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
import { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";
import { loginSchemaUser } from "../../lib/validator/auth.login.schema";

export function LoginTenantForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchemaUser>>({
    resolver: zodResolver(loginSchemaUser),
    defaultValues: { email: "", password: "" },
  });

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof loginSchemaUser>) => {
      const { data } = await axiosInstance.post("auth/login", {
        email: body.email,
        password: body.password,
      });
      return data;
    },
    onSuccess: async (data) => {
      await signIn("credentials", {
        redirect: false,
        ...data,
      });
      toast.success("Login success");
      router.push("/");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log("FULL ERROR:", error.response?.data);
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
  async function onSubmit(data: z.infer<typeof loginSchemaUser>) {
    console.log("FORM DATA:", data);
    await login(data);
  }

  return (
    <form
      id="form-register"
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-blue-700">
            Welcome back, Tenant!
          </h1>

          <p className="text-muted-foreground text-sm text-balance">
            Log in to manage your properties and create more nuits booking
            transaction.
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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password here..."
            required
            {...form.register("password")}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={isPending}
            className="font-bold text-white rounded-l-lg"
          >
            {isPending ? "Loading" : "Log in"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/register/tenant"
              className="underline underline-offset-4 text-blue-800"
            >
              Sign up
            </a>
          </FieldDescription>
          <FieldDescription className="text-center">
            You are not a tenant?{" "}
            <a
              href="/auth/login/user"
              className="underline underline-offset-4 text-blue-800"
            >
              Log in as user
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
