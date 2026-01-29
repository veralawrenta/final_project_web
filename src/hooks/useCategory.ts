import { axiosInstance } from "@/lib/axios";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export const useGetCategories = () => {
  const session = useSession();

  return useQuery({
    queryKey: ["getCategories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/categories/`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
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
      queryClient.invalidateQueries({ queryKey: ["create-category"] });
      setTimeout(() => {
        router.push("/dashboard/category");
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
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setTimeout(() => {
        router.push("/dashboard/category");
      }, 1500);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to edit category");
    },
  });
};
