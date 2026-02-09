import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Authentication Error</h1>
      <p className="text-red-600">
        We could not sign you in. Please try again.
      </p>
      <Link href="/" className="text-primary">
        Back to homepage
      </Link>
    </div>
  );
}
