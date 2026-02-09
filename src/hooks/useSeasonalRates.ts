import { axiosInstance } from "@/lib/axios";
import { formatLocalDate } from "@/lib/date/date";
import {
  createSeasonalRatesSchema,
  updateSeasonalRatesSchema,
} from "@/lib/validator/dashboard.seasonalrates.schema";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import { SeasonalRates } from "@/types/seasonal-rates";

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
  const session = useSession();

  return useQuery({
    queryKey: ["seasonalRates", seasonalRateId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SeasonalRates>(
        `/seasonal-rates/${seasonalRateId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken,
  });
};

export const useGetSeasonalRatesbyTenant = (
  queries?: GetSeasonalRatesQuery
) => {
  const session = useSession();

  return useQuery({
    queryKey: ["seasonalRates", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<SeasonalRates>>(
        `/seasonal-rates`,
        {
          params: queries,
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken,
  });
};

export const useCreateSeasonalRates = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      payload: z.infer<typeof createSeasonalRatesSchema> //& { roomId: number }
    ) => {
      const formattedBody = {
        name: payload.name,
        startDate: formatLocalDate(payload.startDate),
        endDate: formatLocalDate(payload.endDate),
        fixedPrice: payload.fixedPrice,
        roomId: payload.roomId,
        propertyId: payload.propertyId,
      };
      const { data } = await axiosInstance.post(
        `/seasonal-rates`,
        formattedBody,
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
    mutationFn: async (body: {
      name?: string;
      startDate?: string;
      endDate?: string;
      fixedPrice?: number;
    } ) => {
      const payload: Record<string, unknown> = {};
      if (body.name !== undefined) payload.name = body.name;
      if (body.fixedPrice !== undefined) payload.fixedPrice = body.fixedPrice;
      if (body.startDate) payload.startDate = body.startDate;
      if (body.endDate) payload.endDate = body.endDate;

      const { data } = await axiosInstance.patch(
        `/seasonal-rates/${seasonalRateId}`,
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
        `/seasonal-rates/${seasonalRateId}`,
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
