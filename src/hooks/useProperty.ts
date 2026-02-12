import { axiosInstance } from "@/lib/axios";
import { formatLocalDate } from "@/lib/date/date";
import { UpdatePropertFormValues } from "@/lib/validator/dashboard.update-property.schema";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import {
  CalendarResponse,
  Property,
  PropertyDetail,
  PropertyType,
  TenantProperty,
  TenantPropertyId,
} from "@/types/property";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PropertiesQueryParams extends PaginationQueryParams {
  search?: string;
  propertyType?: PropertyType;
}

interface SearchPropertiesParams extends PropertiesQueryParams {
  cityId: number;
  checkIn: Date;
  checkOut: Date;
  totalGuests: number;
}

export const useSearchProperties = (
  queries: SearchPropertiesParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["properties", queries?.search ?? "",
      queries.cityId,
      queries.checkIn ? formatLocalDate(queries.checkIn) : "",
      queries.checkOut ? formatLocalDate(queries.checkOut) : "",
      queries.take ?? 3,
      queries.page ?? 1,
      queries.sortBy ?? "name",
      queries.sortOrder ?? "asc",
      queries.propertyType ?? "",
    ],
    queryFn: async () => {
      const params = {
        ...queries,
        checkIn: formatLocalDate(queries.checkIn),
        checkOut: formatLocalDate(queries.checkOut),
      };
      const { data } = await axiosInstance.get<PageableResponse<Property>>(
        "/properties/search",
        {params}
      );
      return data;
    },
    enabled: options?.enabled,
  });
};

export const useGetAllProperties = (
  queries?: PropertiesQueryParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["properties", "public", queries?.search ?? "",
      queries?.page ?? 1,
      queries?.sortBy ?? "name",
      queries?.sortOrder ?? "asc",
      queries?.propertyType ?? "",
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Property>>(
        "/properties/public",
        {params: queries}
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
        `/properties/${propertyId}/calendar-prices`,
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

export const useGetTenantProperties = (queries?: PropertiesQueryParams) => {
  const session = useSession();

  return useQuery({
    queryKey: [
      "tenant-properties",
      queries?.search ?? "",
      queries?.page ?? 1,
      queries?.take ?? 3,
      queries?.sortBy ?? "name",
      queries?.sortOrder ?? "asc",
      queries?.propertyType ?? "",
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        PageableResponse<TenantProperty>
      >("/properties", {
        params: queries,
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    enabled: !!session.data?.user.accessToken,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetTenantPropertyId = (propertyId: number) => {
  const session = useSession();

  return useQuery({
    queryKey: ["tenant-property-id", propertyId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TenantPropertyId>(
        `/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    enabled: !!session.data?.user.accessToken,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProperty = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axiosInstance.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Property created successfully");
      queryClient.invalidateQueries({ queryKey: ["properties", "tenant"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create property");
    },
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
      toast.dismiss("create-room");
      toast.success("Property published successfully!");
      router.push("/dashboard/tenant/property");
      queryClient.invalidateQueries({ queryKey: ["properties", "tenant"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to publish property"
      );
    },
  });
};

export const useUpdateProperty = (propertyId: number) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: UpdatePropertFormValues) => {
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
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      queryClient.invalidateQueries({
        queryKey: ["tenant-property-id", propertyId],
      });
      toast.success("Property updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/tenant/property");
      }, 1000);
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
