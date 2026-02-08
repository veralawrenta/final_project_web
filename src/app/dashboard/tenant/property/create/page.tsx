"use client";
import CreatePropertyForms from "@/components/dashboard-tenant/property/CreatePropertyForms";
import { useRouter } from "next/navigation";

export default function CreatePropertyPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/dashboard/tenant/property");
  };

  return (
    <div className="container max-w-5xl py-8">
      {/* This calls the wizard component */}
      <CreatePropertyForms onCancel={handleCancel} />
    </div>
  );
}
