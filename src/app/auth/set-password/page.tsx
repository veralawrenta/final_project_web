import { Suspense } from "react";
import VerifyAndSetPasswordForm from "../../../components/auth/VerifySetPassword";

export default function VerifyandSetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading…</p>}>
      <VerifyAndSetPasswordForm />
    </Suspense>
  );
}
