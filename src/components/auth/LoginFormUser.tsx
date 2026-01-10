"use client";
import { signIn } from "next-auth/react";

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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";
import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { loginSchemaUser } from "../../lib/validator/auth.login.schema";
import { toast } from "react-toastify";
import ButtonGoogle from "../google/ButtonGoogle";

export function LoginFormUser({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  
  const form = useForm<z.infer<typeof loginSchemaUser>>({
    resolver: zodResolver(loginSchemaUser),
    defaultValues: { email: "", password: "" },
  });

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: async (credentials: z.infer<typeof loginSchemaUser>) => {
      const { data } = await axiosInstance.post("auth/login", {
        email: credentials.email,
        password: credentials.password,
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

  const onSubmit = async (data: z.infer<typeof loginSchemaUser>) => {
    await login(data);
  };

  /*const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };*/

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="container mx-auto p-2 space-y-4">
        <Card className="border-2 shadow-2xl">
          <Link
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <Image
              src="/images/staynuit-name.png"
              width={200}
              height={50}
              alt="Website Logo"
            ></Image>
          </Link>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back, user!</CardTitle>
            <CardDescription>Login with your Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                 <ButtonGoogle />
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card max-w-">
                  or
                </FieldSeparator>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="enter your email here..."
                    required
                    className="text-sm"
                    {...form.register("email")}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="enter password here..."
                    required
                    className="text-sm"
                    {...form.register("password")}
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    form="form-login-user"
                    disabled={isPending}
                    className="font-semibold text-white bg-primary hover:bg-primary/90 cursor-pointer"
                  >
                    {isPending ? "Logging in..." : "Login"}
                  </Button>
                  <FieldDescription className="text-center text-black">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/"
                      className="text-primary hover:text-primary/50"
                    >
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <Link href="/">Terms of Service</Link> and{" "}
          <Link href="/">Privacy Policy</Link>.
        </FieldDescription>
      </div>
    </div>
  );
}
