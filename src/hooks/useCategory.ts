import { axiosInstance } from "@/lib/axios";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/category/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    //enabled: !!id,
  });
};

export const useUpdateCategory = (id: number) => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof categoryFormSchema>) => {
      const { data } = await axiosInstance.patch(`/category/${id}`, payload, {
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
