import Sidebar from "@/components/profile-user/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="md:p-8 p-4 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
