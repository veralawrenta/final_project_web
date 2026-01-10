"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Authentication Error</h1>
      <p className="text-red-600">{error}</p>
      <Link href="/auth/login/user" className="text-primary">
        Back to login
      </Link>
    </div>
  );
}
