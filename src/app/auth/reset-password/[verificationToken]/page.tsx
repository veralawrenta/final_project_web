import { ResetPasswordForm } from "@/components/auth/ResetPassword";

interface ResetPasswordProps {
  params: Promise<{ verificationToken: string }>;
}

export default async function ResetPasswordPage(props: ResetPasswordProps) {
  const { verificationToken } = await props.params;
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResetPasswordForm verificationToken={verificationToken} />
      </div>
    </div>
  );
}
