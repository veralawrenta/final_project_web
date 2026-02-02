"use client"
import SeasonalRateManagementTab from "@/components/dashboard-tenant/seasonal-rates/SeasonalRateManagement";
import { SeasonalRates } from "@/types/room";
import { useRouter } from "next/navigation";

const SeasonalRatesPage = () => {
  const router = useRouter();

  const handleAddRate = () => {
    router.push("/dashboard/tenant/seasonal-rates/create");
  };

  const handleEditRate = (rate: SeasonalRates) => {
    router.push(`/dashboard/tenant/seasonal-rates/update/${rate.id}`);
  };

  return (
    <div>
      <SeasonalRateManagementTab
        onAddRate={handleAddRate}
        onEditRate={handleEditRate}
      />
    </div>
  );
};

export default SeasonalRatesPage;

