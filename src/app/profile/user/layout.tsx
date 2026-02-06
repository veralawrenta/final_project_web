import { auth } from "@/auth";
import Sidebar from "@/components/profile-user/Sidebar";
import { Role } from "@/types/user";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) redirect("/auth/login/user");
  if (session?.user.role !== Role.USER) redirect("/");
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="md:p-8 p-4 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  );
};
export default DashboardLayout;
