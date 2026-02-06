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

export const useGetCategoriesForTenant = (queries?: GetCategoriesQuery) => {
  const session = useSession();
  return useQuery({
    queryKey: ["categories-tenant", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Category>>(
        `/categories`,
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

export const useGetCategories = () => {
  const session = useSession();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Category[]>("/categories", {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data; // Returns array directly
    },
    enabled: !!session.data?.user.accessToken,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGetCategory = (categoryId: number) => {
  const session = useSession();
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    enabled: !!categoryId && !!session.data?.user.accessToken,
  });
};

export const useCreateCategory = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof categoryFormSchema>) => {
      const { data } = await axiosInstance.post(`/categories`, payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-tenant"] });
      setTimeout(() => {
        router.push("/dashboard/tenant/category");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = (categoryId: number) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: z.infer<typeof categoryFormSchema>) => {
      const { data } = await axiosInstance.patch(
        `/categories/${categoryId}`,
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
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-tenant"] });
      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      router.push("/dashboard/tenant/category");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      const { data } = await axiosInstance.delete(`/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-tenant"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to delete category");
    },
  });
};
