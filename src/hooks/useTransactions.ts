import { axiosInstance } from "@/lib/axios";
import {
  CreateTransactionFormValues,
  uploadPaymentProofSchema,
} from "@/lib/validator/profile.transaction.schema";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import {
  MonthlyRevenue,
  Transactions,
  TransactionStatus
} from "@/types/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

interface TransactionQueryParams extends PaginationQueryParams {
  search?: string;
  propertyName?: string;
  transactionId?: string;
  status?: TransactionStatus[];
}

interface TransactionResponse {
  transactionId: string;
  paymentUrl: string;
  status: TransactionStatus;
}


export const useGetAllUserTransaction = (queries?: TransactionQueryParams) => {
  const session = useSession();

  return useQuery({
    queryKey: ["userTransactions", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Transactions>>(
        `transactions/user`,
        {
          params: queries,
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

export const useCreateTransaction = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      values: CreateTransactionFormValues,
    ): Promise<TransactionResponse> => {
      const { data } = await axiosInstance.post("transactions", values, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Transaction created successfully");
      queryClient.invalidateQueries({
        queryKey: ["userTransactions", "tenantTransactions"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to create transaction",
      );
    },
  });
};

export const useGetTransactionIdByUser = (transactionId: string) => {
  const session = useSession();

  return useQuery({
    queryKey: ["user-transaction", transactionId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Transactions>(
        `transactions/${transactionId}/user`,
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
export const useGetTransactionIdByTenant = (transactionId: string) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenant-transaction", transactionId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Transactions>(
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

export const useCancelTransactionByUser = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data } = await axiosInstance.post(
        `transactions/${transactionId}/user/cancel`,
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

export const useUploadPaymentProof = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: z.infer<typeof uploadPaymentProofSchema>) => {
      const form = new FormData();
      form.append("transactionId", body.transactionId);
      form.append("paymentProof", body.paymentProof);

      const { data } = await axiosInstance.post<{ paymentProof: string }>(
        `transactions/${body.transactionId}/payment-proof`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Payment proof uploaded successfully");
      setTimeout(() => {
        router.push(`/profile/user/transactions`);
      }, 1000);
      queryClient.invalidateQueries({
        queryKey: ["tenantTransactions", "userTransactions"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to upload payment proof",
      );
    },
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

