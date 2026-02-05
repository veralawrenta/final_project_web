import { axiosInstance } from "@/lib/axios";
import { formatLocalDate } from "@/lib/date/date";
import { StepOneFormData } from "@/lib/validator/dashboard.create-property.schema";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import {
  CalendarResponse,
  Property,
  PropertyDetail,
  PropertyType,
  TenantPropertyId,
} from "@/types/property";
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface GetPropertiesQuery extends PaginationQueryParams {
  search?: string;
}

interface GetAllPropertiesQuery {
  page?: number;
  take?: number;
  sortBy?: "name" | "price";
  sortOrder?: "asc" | "desc";
  propertyType?: PropertyType | "all";
}

interface GetPropertySearchParams extends PaginationQueryParams {
  cityId: number;
  checkIn: Date;
  checkOut: Date;
  totalGuests: number;
  sortBy?: "name" | "price";
  sortOrder?: "asc" | "desc";
  propertyType?: string;
  search?: string;
}

export const useSearchProperties = (
  queries: GetPropertySearchParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["properties", "search", queries],
    queryFn: async () => {
      const { checkIn, checkOut, ...rest } = queries;
      const { data } = await axiosInstance.get<PageableResponse<Property>>(
        "/properties/search",
        {
          params: {
            ...rest,
            checkIn: formatLocalDate(checkIn),
            checkOut: formatLocalDate(checkOut),
          },
        }
      );
      return data;
    },
    enabled: options?.enabled !== false,
  });
};

export const useGetAllProperties = (
  queries?: GetAllPropertiesQuery,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["properties", "public", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Property>>(
        "/properties/public",
        {
          params: {
            ...queries,
            propertyType:
              queries?.propertyType === "all"
                ? undefined
                : queries?.propertyType,
          },
        }
      );
      return data;
    },
    staleTime: 10 * 60 * 1000, //ten mins
    enabled: options?.enabled !== false, // Enable by default, can be overridden
  });
};

export const useGetPropertyWithAvailability = (
  propertyId: number,
  checkIn: Date,
  checkOut: Date,
  totalGuests: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "property",
      propertyId,
      "availability",
      {
        checkIn: formatLocalDate(checkIn),
        checkOut: formatLocalDate(checkOut),
        totalGuests,
      },
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PropertyDetail>(
        `/properties/${propertyId}/availability`,
        {
          params: {
            checkIn: formatLocalDate(checkIn),
            checkOut: formatLocalDate(checkOut),
            totalGuests,
          },
        }
      );
      return data;
    },
    enabled:
      enabled && !!propertyId && !!checkIn && !!checkOut && totalGuests > 0,
  });
};

export const useGetMonthCalendarSearch = (
  propertyId: number,
  startDate?: Date,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "property",
      propertyId,
      "calendar",
      startDate ? formatLocalDate(startDate) : undefined,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<CalendarResponse>(
        `/properties/${propertyId}/availability-preview`,
        {
          params: startDate ? { startDate: formatLocalDate(startDate) } : {},
        }
      );
      return data;
    },
    enabled: enabled && !!propertyId && !!startDate,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetTenantProperties = (queries?: GetPropertiesQuery) => {
  return useQuery({
    queryKey: ["tenant-properties", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/properties", {
        params: queries,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetTenantPropertyId = (propertyId: number) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenant-property-id", propertyId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TenantPropertyId>(`/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`
        },
      });
      return data;
    },
  });
}

export const useCreateProperty = () => {
  const session = useSession();

  return useMutation({
    mutationFn: async (data: StepOneFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("address", data.address);
      formData.append("cityId", data.cityId.toString());
      formData.append("categoryId", data.categoryId.toString());
      formData.append("latitude", data.latitude.toString());
      formData.append("longitude", data.longitude.toString());
      formData.append("propertyType", data.propertyType);
      formData.append("amenities", JSON.stringify(data.amenities));
      
      data.urlImages.forEach((file) => {
        formData.append("urlImages", file);
      });

      const response = await axiosInstance.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Property created successfully");
      return data;
    },
    onError: (error: AxiosError<{ message: string }>) => {toast.error(error.response?.data.message || "Failed to create property")},
  });
};

export const usePublishProperty = () => {
  const session = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: number) => {
      const response = await axiosInstance.patch(
        `/properties/${propertyId}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Property published successfully!");
      router.push("/dashboard/tenant/property");
      queryClient.invalidateQueries({ queryKey: ["properties", "tenant"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to publish property");
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const params = useParams();
  const propertyId = Number(params.id);

  return useMutation({
    mutationFn: async (body: {
      name?: string;
      description?: string;
      address?: string;
      cityId?: number;
      categoryId?: number;
      propertyType?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      const { data } = await axiosInstance.patch(
        `/properties/${propertyId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "tenant"] });
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      toast.success("Property updated successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update property");
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (propertyId: number) => {
      const { data } = await axiosInstance.delete(`/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      toast.success("Property deleted successfully!");
      router.push("/dashboard/tenant/property");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message ||
          "Failed to delete property. Please check if there are active bookings."
      );
    },
  });
};
