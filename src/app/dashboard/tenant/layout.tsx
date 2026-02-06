import { auth } from "@/auth";
import Dashboard from "@/components/dashboard-tenant/Dashboard";
import { Role } from "@/types/user";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if(!session) redirect("/auth/login/tenant")
  if (session?.user.role !== Role.TENANT) redirect("/");
  
  return <Dashboard>{children}</Dashboard>;
};
