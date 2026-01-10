"use client"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import z from "zod"
import { registerSchemaCredentials } from "../../lib/validator/auth.register-user.schema"
import { useMutation } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "react-toastify"

export function SignupFormUser({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof registerSchemaCredentials>>({
    resolver: zodResolver(registerSchemaCredentials),
    defaultValues: { firstName: "", lastName:"", email: "", role: "USER" },
  });

  const { mutateAsync : register, isPending } = useMutation({
  mutationFn: async (credentials: z.infer<typeof registerSchemaCredentials>) => {
    const { data } = await axiosInstance.post("/auth/register/user", {
      email: credentials.email,
      role: credentials.role,
    });
    return data;
  },
  onSuccess: () => {
    toast.success("Register success");
  },
  onError: (error: AxiosError<{message: string}>) => {
    toast.error(error.response?.data.message ?? "Something went wrong");
  },
})

  async function onSubmit(data: z.infer<typeof registerSchemaCredentials>) {
    await register(data)
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="container mx-auto border-2 border-accent-foreground rounded-xl p-2 shadow-xl space-y-4">
        <div className="p-3">
      <form id="form-register" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Image
            src="/images/staynuit-name.png"
            width={200}
            height={200}
            alt="Website Logo"
            loading="eager"
            className="h-auto w-auto"/>
            <h1 className="text-xl font-bold mt-2 tracking-wide">Welcome Nuitbooker</h1>
            <FieldDescription className="text-black">
              Already have an account? <Link href="/auth/login/user" className="text-primary">Sign in</Link>
            </FieldDescription>
          </div>
          <Field>
          <FieldLabel htmlFor="firstName" className="font-bold px-2 mt-2">First Name</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="enter your first name here"
              required
              {...form.register("firstName")}
            />
            <FieldLabel htmlFor="lastName" className="font-bold px-2 mt-2">Last Name</FieldLabel>
            <Input
              id="lastName"
              type="text"
              placeholder="enter your last name here"
              required
              {...form.register("lastName")}
            />
            <FieldLabel htmlFor="email" className="font-bold px-2 mt-2">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="enter your email here"
              required
              {...form.register("email")}
            />
          </Field>
          <Field>
            <Button type="submit" form="form-register" disabled={isPending}
            className="font-bold text-white rounded-l-lg">{isPending ? "Loading" : "Create Account"}</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <Button variant="outline" type="button"
            onClick={() => signIn("google")}
            className="text-primary font-bold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
      </div>
      </div>
    </div>
  )
}
