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
import { axiosInstance } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import z from "zod";
import { changeEmailSchema } from "../../change-email/schema";

interface ChangeEmailFormProps extends React.HTMLProps<HTMLDivElement> {
  className?: string;
}

export function ChangeEmailForm({ className, ...props }: ChangeEmailFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { oldEmail: "", newEmail: "" },
  });

  const { mutateAsync: changeEmail, isPending } = useMutation({
    mutationFn: async (body: z.infer<typeof changeEmailSchema>) => {
      const { data } = await axiosInstance.post("/auth/change-email", body);
      return data;
    },
    onSuccess: () => {
      toast.success("send email success, check your new email");
      router.push("/")
    },
    onError: () => {
      toast.error("send email failed");
      router.push("/auth/error")
    },
  });

  async function onSubmit(body: z.infer<typeof changeEmailSchema>) {
    await changeEmail(body);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-primary">Change Email Request</CardTitle>
          <CardDescription className="text-base leading-tight text-zinc-600">
            Enter your email below to confirm your request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Old Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your current email here."
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">New Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your new email here."
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
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
