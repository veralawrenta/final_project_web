import { axiosInstance } from "@/lib/axios";
import { PaginationQueryParams, TenantTransactionResponse } from "@/types/pagination";
import { CalendarTransaction, TenantActivityResponse, TransactionStatusFilter } from "@/types/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface TenantTransactionQueryParams extends PaginationQueryParams {
    search?: string;
    status?: TransactionStatusFilter;
}

export const useGetAllTenantTransactions = (
  queries?: TenantTransactionQueryParams,
) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenantTransactions", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TenantTransactionResponse>(
        "transactions/tenant",
        {
          params: {...queries,
            status: queries?.status?.toUpperCase(),
          },
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken,
  });
};

export const useCancelTransactionByTenant = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data } = await axiosInstance.post(
        `transactions/${transactionId}/tenant/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Transaction cancelled successfully");
      queryClient.invalidateQueries({
        queryKey: ["tenantTransactions", "userTransactions"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to cancel transaction",
      );
    },
  });
};

export const useRejectTransaction = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      const { data } = await axiosInstance.post(
        `transactions/${transactionId}/tenant/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Transaction rejected successfully");
      queryClient.invalidateQueries({
        queryKey: ["tenantTransactions", "userTransactions"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to reject transaction",
      );
    },
  });
};

export const useConfirmTransaction = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data } = await axiosInstance.post(
        `transactions/${transactionId}/tenant/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Transaction confirmed successfully");
      queryClient.invalidateQueries({
        queryKey: ["tenantTransactions", "userTransactions"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to confirm transaction",
      );
    },
  });
};

export const useTenantActivity = () => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenantActivity"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TenantActivityResponse>(
        "dashboard/me/activity",
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken,
  });
};

export const useTransactionForCalendar = (
  startDate: string,
  endDate: string,
) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenantTransactions", startDate, endDate],
    queryFn: async () => {
      const { data } = await axiosInstance.get<CalendarTransaction[]>(
        "transactions/tenant/transactionCalendar}",
        {
          params: {
            startDate,
            endDate,
          },
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken,
  });
};