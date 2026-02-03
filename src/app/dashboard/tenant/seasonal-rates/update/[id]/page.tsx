"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetSeasonalRateById, useUpdateSeasonalRates } from "@/hooks/useSeasonalRates";
import { fromDateString } from "@/lib/date/date";
import z from "zod";
import { updateSeasonalRatesSchema } from "@/lib/validator/dashboard.seasonalrates.schema";
import { SeasonalRateForm } from "@/components/dashboard-tenant/seasonal-rates/SeasonalRateForm";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function UpdateSeasonalRatePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const seasonalRateId = Number(params.id);

  const { data: seasonalRate, isPending: getSeasonalRateLoading } =
    useGetSeasonalRateById(seasonalRateId);
  const { mutateAsync, isPending } = useUpdateSeasonalRates(seasonalRateId);

  const form = useForm<z.infer<typeof updateSeasonalRatesSchema>>({
    resolver: zodResolver(updateSeasonalRatesSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      fixedPrice: undefined,
    },
  });

  useEffect(() => {
    if (!seasonalRate) return;

    form.reset({
      name: seasonalRate.name ?? "",
      startDate: fromDateString(seasonalRate.startDate),
      endDate: fromDateString(seasonalRate.endDate),
      fixedPrice: seasonalRate.fixedPrice,
    });
  }, [seasonalRate, form]);

  const handleSubmit = async (values: z.infer<typeof updateSeasonalRatesSchema>) => {
    await mutateAsync(values);
  };

  if (getSeasonalRateLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SeasonalRateForm<z.infer<typeof updateSeasonalRatesSchema>>
      form={form}
      submitLabel="Update Rate"
      isSubmitting={isPending}
      onCancel={() => router.back()}
      onSubmit={handleSubmit}
      fields={{
        name: "name",
        startDate: "startDate",
        endDate: "endDate",
        fixedPrice: "fixedPrice",
      }}
    />
  );
}
