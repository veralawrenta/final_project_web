"use client";

import { SeasonalRateForm } from "@/components/dashboard-tenant/seasonal-rates/SeasonalRateForm";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useGetTenantRooms } from "@/hooks/useRoom";
import { useCreateSeasonalRates } from "@/hooks/useSeasonalRates";
import { createSeasonalRatesSchema } from "@/lib/validator/dashboard.seasonalrates.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function CreateSeasonalRatePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateSeasonalRates();
  const { data: propertiesData } = useGetTenantProperties({ take: 500 });
  const { data: roomsData } = useGetTenantRooms({ take: 500 });
  
  // Transform properties data
  const properties = useMemo(
    () =>
      (propertiesData?.data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
      })),
    [propertiesData?.data]
  );

  // Transform rooms data to include property information
  const rooms = useMemo(
    () =>
      (roomsData?.data ?? [])
        .filter((r) => r.property) // Filter out rooms without property
        .map((r) => ({
          id: r.id,
          name: r.name,
          propertyId: r.propertyId!,
          propertyName: r.property!.name,
        })),
    [roomsData?.data]
  );

  const form = useForm<z.infer<typeof createSeasonalRatesSchema>>({
    resolver: zodResolver(createSeasonalRatesSchema),
    defaultValues: {
      roomId: null,
      propertyId: null,
      name: "",
      startDate: undefined,
      endDate: undefined,
      fixedPrice: 0,
    },
  });

  const handleSubmit = async (
    values: z.infer<typeof createSeasonalRatesSchema>
  ) => {
    await mutateAsync(values);
  };

  return (
    <SeasonalRateForm<z.infer<typeof createSeasonalRatesSchema>>
      form={form}
      submitLabel="Create Rate"
      isSubmitting={isPending}
      onCancel={() => router.back()}
      onSubmit={handleSubmit}
      properties={properties}
      fields={{
        name: "name",
        startDate: "startDate",
        endDate: "endDate",
        fixedPrice: "fixedPrice",
        roomId: "roomId",
        propertyId: "propertyId",
      }}
    />
  );
}