import { axiosInstance } from "@/lib/axios";
import { formatLocalDate } from "@/lib/date";
import {
  createSeasonalRatesSchema,
  updateSeasonalRatesSchema,
} from "@/lib/validator/dashboard.seasonalrates.schema";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import { SeasonalRates } from "@/types/room";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

interface GetSeasonalRatesQuery extends PaginationQueryParams {
  search?: string;
}

export const useGetSeasonalRateById = (seasonalRateId: number) => {
  return useQuery({
    queryKey: ["seasonalRates", seasonalRateId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SeasonalRates>(
        `/seasonalRates/${seasonalRateId}`
      );
      return data;
    },
    enabled: Boolean(seasonalRateId) && !Number.isNaN(seasonalRateId),
  });
};

export const useGetSeasonalRatesbyTenant = (
  queries?: GetSeasonalRatesQuery
) => {
  return useQuery({
    queryKey: ["seasonalRates", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<SeasonalRates>>(
        `/seasonalRates`,
        { params: queries }
      );
      return data;
    },
  });
};

export const useCreateSeasonalRates = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      payload: z.infer<typeof createSeasonalRatesSchema> & { roomId: number }
    ) => {
      const { roomId, ...body } = payload;
      const { data } = await axiosInstance.post(
        `/seasonalRates/rooms/${roomId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasonalRates"] });
      toast.success("Create seasonal rate success");
      router.push("/dashboard/tenant/seasonal-rates");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to create seasonal rate"
      );
    },
  });
};

export const useUpdateSeasonalRates = (seasonalRateId: number) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: z.infer<typeof updateSeasonalRatesSchema>) => {
      //partial edit
      const payload: Record<string, unknown> = {};
      if (body.name !== undefined) payload.name = body.name;
      if (body.fixedPrice !== undefined) payload.fixedPrice = body.fixedPrice;
      if (body.startDate)
        payload.startDate = formatLocalDate(body.startDate);

      if (body.endDate)
        payload.endDate = formatLocalDate(body.endDate);

      const { data } = await axiosInstance.patch(
        `/seasonalRates/${seasonalRateId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasonalRates"] });
      toast.success("Update seasonal rate success");
      router.push("/dashboard/tenant/seasonal-rates");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to update seasonal rate"
      );
    },
  });
};

export const useDeleteSeasonalRates = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (seasonalRateId: number) => {
      const { data } = await axiosInstance.delete(
        `/seasonalRates/${seasonalRateId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasonalRates"] });
      toast.success("Delete seasonal rate success");
      router.push("/dashboard/tenant/seasonal-rates");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to delete seasonal rate"
      );
    },
  });
};
