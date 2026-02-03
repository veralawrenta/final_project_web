import { auth } from "@/auth";
import Dashboard from "@/components/dashboard-tenant/Dashboard";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user.role !== "TENANT") redirect("/");
  
  return <Dashboard>{children}</Dashboard>;
}
