import { axiosInstance } from "@/lib/axios";
import {
  createReplyReviewSchema,
  CreateReviewPayload
} from "@/lib/validator/dashboard.reviews.schema";
import {
  PaginationQueryParams
} from "@/types/pagination";
import { ReviewResponse } from "@/types/reviews";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

interface GetAllUserReviewsQuery extends PaginationQueryParams {
  search?: string;
  filter?: "all" | "reviewed" | "pending";
  propertyName?: string;
  transactionId?: number;
}

interface GetAllTenantReviewsQuery extends PaginationQueryParams {
  search?: string;
  filter?: "all" | "reviewed" | "pending";
}

export const useGetAllPropertyReviews = (propertyId: number, queries: PaginationQueryParams) => {
  return useQuery({
    queryKey: ["propertyReviews", propertyId, queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ReviewResponse>(
       `reviews/property/${propertyId}`,
        {
          params: queries,
        }
      );
      return data;
    },
  });
};

export const useGetAllUserReviews = (queries?: GetAllUserReviewsQuery) => {
  const session = useSession();
  return useQuery({
    queryKey: ["userReviews", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ReviewResponse>(
        "reviews/user",
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

export const useCreateReviewByUser = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const { data } = await axiosInstance.post("/reviews/user", payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Your review created successfully");
      queryClient.invalidateQueries({ queryKey: ["tenantReviews"] });
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      setTimeout(() => {
        router.push("/dashboard/tenant/reviews");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create reply");
    },
  });
};

export const useGetAllTenantReviews = (queries?: GetAllTenantReviewsQuery) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenantReviews", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ReviewResponse>(
        "reviews/tenant",
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

export const useReplyReview = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof createReplyReviewSchema>) => {
      const { data } = await axiosInstance.patch(
        "reviews/tenant/reply",
        payload,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Your reply created successfully");
      queryClient.invalidateQueries({ queryKey: ["tenantReviews"] });
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
      setTimeout(() => {
        router.push("/dashboard/tenant/reviews");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create reply");
    },
  });
};
