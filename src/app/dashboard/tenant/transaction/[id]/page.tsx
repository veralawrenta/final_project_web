"use client"
import TenantTransactionDetails from "@/components/dashboard-tenant/transactions/TenantTransactionDetails";
import { useRouter } from "next/navigation";

const TransactionIdPage = () => {
  const router = useRouter();

  const handleOnBack = () => {
    router.back();
  };

  return (
    <div>
      <TenantTransactionDetails
        onBack={handleOnBack}
      />
    </div>
  );
};

export default TransactionIdPage;
