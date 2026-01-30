import { axiosInstance } from "@/lib/axios";
import { createPropertySchema } from "@/lib/validator/dashboard.create-property.schema";
import { PaginationQueryParams } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import z from "zod";

interface GetPropertiesQuery extends PaginationQueryParams {
  search?: string;
}
export const useSearchProperty = () => {};

export const useGetTenantProperties = (queries?: GetPropertiesQuery) => {
  const session = useSession();
  return useQuery({
    queryKey: ["tenant-property", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get("property/", {
        params: queries,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProperty = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: z.infer<typeof createPropertySchema>) => {
      const { data } = await axiosInstance.post(
        "property/",
        {
          name: values.name,
          description: values.description,
          categoryId: values.categoryId,
          cityId: values.cityId,
          latitude: values.latitude,
          longitude: values.longitude,
          propertyType: values.propertyType,
        },
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Create property successfully");
      router.push("/dashboard/tenant/property");
      queryClient.invalidateQueries({ queryKey: ["me-profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update profile");
    },
  });
};
