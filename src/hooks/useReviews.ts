import { axiosInstance } from "@/lib/axios";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import { Reviews } from "@/types/reviews";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface GetAllUserReviewsQuery extends PaginationQueryParams {
    search?: string;
    filter?: "all" | "reviewed" | "pending";
    propertyName?: string;
    transactionId?: number;
};

export const useGetAllUserReviews = (queries?: GetAllUserReviewsQuery) => {
  const session = useSession();
  return useQuery<PageableResponse<Reviews>>({
    queryKey: ["user-reviews", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Reviews>>(
        "/reviews/user",
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