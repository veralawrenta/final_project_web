import VerifyChangeEmailForm from "@/components/auth/VerifyChangeEmailForm";
import { Suspense } from "react";

export default function VerifyChangeEmailPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense fallback={<p className="text-center p-6">Loading…</p>}>
          <VerifyChangeEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
