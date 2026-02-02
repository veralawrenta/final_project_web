"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSeasonalRatesSchema } from "@/lib/validator/dashboard.seasonalrates.schema";
import { useCreateSeasonalRates } from "@/hooks/useSeasonalRates";
import { useGetTenantRooms } from "@/hooks/useRoom";
import z from "zod";
import { SeasonalRateForm } from "@/components/dashboard-tenant/seasonal-rates/SeasonalRateForm";
import { useMemo } from "react";

export default function CreateSeasonalRatePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateSeasonalRates();
  const { data: roomsData } = useGetTenantRooms({ take: 500 });
  const rooms = useMemo(
    () =>
      (roomsData?.data ?? []).map((r) => ({ id: r.id, name: r.name })),
    [roomsData?.data]
  );

  const form = useForm<z.infer<typeof createSeasonalRatesSchema>>({
    resolver: zodResolver(createSeasonalRatesSchema),
    defaultValues: {
      roomId: 0,
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
      rooms={rooms}
      fields={{
        name: "name",
        startDate: "startDate",
        endDate: "endDate",
        fixedPrice: "fixedPrice",
        roomId: "roomId",
      }}
    />
  );
}
