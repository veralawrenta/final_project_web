import { axiosInstance } from "@/lib/axios";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import { Category } from "@/types/category";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

interface GetCategoriesQuery extends PaginationQueryParams {
  search?: string;
}

export const useGetCategories = (queries?: GetCategoriesQuery) => {
  return useQuery({
    queryKey: ["getCategories", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Category>>(
        `/categories`,
        { params: queries }
      );
      return data;
    },
  });
};

export const useGetCategoriesForCreateProperty = () => {
  const session = useSession();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/categories", {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    enabled: !!session.data?.user.accessToken,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGetCategory = (id: number) => {
  const session = useSession();
  return useQuery({
    queryKey: ["getCategoryId", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof categoryFormSchema>) => {
      const { data } = await axiosInstance.post(`/categories/`, payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Your category successfully created");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      setTimeout(() => {
        router.push("/dashboard/tenant/category");
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = (id: number) => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof categoryFormSchema>) => {
      const { data } = await axiosInstance.patch(`/categories/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Your category successfully updated");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      setTimeout(() => {
        router.push("/dashboard/tenant/category");
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to edit category");
    },
  });
};

export const useDeleteCategory = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      toast.success("Category deleted");
      setTimeout(() => {
        router.push("/dashboard/tenant/category");
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to delete category");
    },
  });
};
