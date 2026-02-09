"use client";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetSeasonalRateById,
  useUpdateSeasonalRates,
} from "@/hooks/useSeasonalRates";
import { fromDateString, parseISODate } from "@/lib/date/date";
import z from "zod";
import { updateSeasonalRatesSchema } from "@/lib/validator/dashboard.seasonalrates.schema";
import { SeasonalRateForm } from "@/components/dashboard-tenant/seasonal-rates/SeasonalRateForm";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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
      startDate: new Date(),
      endDate: new Date(),
      fixedPrice: 0,
    },
  });

  useEffect(() => {
    if (!seasonalRate) return;
    console.log("typeof startDate:", typeof seasonalRate.startDate);
    //console.log("instanceof Date:", seasonalRate.startDate instanceof Date);
    console.log("Raw dates:", {
      startDate: seasonalRate.startDate,
      endDate: seasonalRate.endDate,
    });
    const startDate = parseISODate(seasonalRate.startDate);
    const endDate = parseISODate(seasonalRate.endDate);

    console.log("Converted dates:", {
      startDate,
      endDate,
      startDateValid: !isNaN(startDate.getTime()),
      endDateValid: !isNaN(endDate.getTime()),
    });
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid dates:", {
        startDate: seasonalRate.startDate,
        endDate: seasonalRate.endDate,
      });
      return;
    }
    form.reset({
      name: seasonalRate.name ?? "",
      startDate,
      endDate,
      fixedPrice: seasonalRate.fixedPrice,
    });
  }, [seasonalRate, form]);

  // ✅ NOW you can do the early return
  if (getSeasonalRateLoading || !seasonalRate) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (
    values: z.infer<typeof updateSeasonalRatesSchema>
  ) => {
    await mutateAsync({
      name: values.name,
      startDate: values.startDate
        ? format(values.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: values.endDate
        ? format(values.endDate, "yyyy-MM-dd")
        : undefined,
      fixedPrice: values.fixedPrice,
    });
  };

  // Get the applied scope info to display to user
  const appliedTo = seasonalRate.propertyId
    ? `${seasonalRate.property?.name} (All rooms)`
    : seasonalRate.room?.name
    ? `${seasonalRate.room.name} (${seasonalRate.room.property?.name})`
    : "Unknown";

  return (
    <div className="space-y-6">
      {/* Display which property/room this rate applies to */}
      <div className="bg-muted/50 border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Applied to:</p>
        <p className="font-medium">{appliedTo}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Note: You cannot change which property or room this rate applies to
          after creation.
        </p>
      </div>

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
    </div>
  );
}
