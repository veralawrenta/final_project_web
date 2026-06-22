import { axiosInstance } from "@/lib/axios";
import { TenantActivityResponse } from "@/types/dashboard";
import { PaginationQueryParams } from "@/types/pagination";
import { CalendarTransaction, MonthlyRevenue, TenantTransactionResponse, TransactionManagementPayload, TransactionStatusFilter } from "@/types/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
            status: queries?.status === "ALL" ? undefined : queries?.status?.toUpperCase(),
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

export const useGetTransactionIdByTenant = (transactionId: string) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenant-transaction", transactionId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TransactionManagementPayload>(
        `transactions/${transactionId}/tenant`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken && !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCancelTransactionByTenant = () => {
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
        `transactions/${transactionId}/tenant/cancel`,
        {reason},
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

export const useConfirmTransactionByTenant = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

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
      setTimeout(() => {
        router.refresh();
      }, 500)
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

export const useGetMonthlyRevenueForTenant = () => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenantMonthlyRevenue"],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const { data } = await axiosInstance.get<MonthlyRevenue[]>(
        `dashboard/me/revenue/monthly/${year}`,
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