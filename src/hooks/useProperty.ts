import { axiosInstance } from "@/lib/axios";
import { formatLocalDate } from "@/lib/date/date";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import {
  CalendarResponse,
  Property,
  PropertyDetail,
  PropertyPayload,
  PropertyType,
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
  const session = useSession();
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

export const useCreateProperty = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PropertyPayload) => {
      const { data } = await axiosInstance.post(
        "property/",
        {
          name: payload.name,
          description: payload.description,
          categoryId: payload.categoryId,
          cityId: payload.cityId,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
          propertyType: payload.propertyType,
        },
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      const propertyId = data.id;

      if (payload.propertyImages.length > 0) {
        for (let i = 0; i < payload.propertyImages.length; i++) {
          const formData = new FormData();
          formData.append("urlImages", payload.propertyImages[i]);
          formData.append("isCover", i === 0 ? "true" : "false");

          await axiosInstance.post(
            `/properties/${propertyId}/property-images`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${session.data?.user.accessToken}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      for (const room of payload.rooms) {
        const { data: createdRoom } = await axiosInstance.post(
          `/properties/${propertyId}/rooms`,
          {
            name: room.name,
            description: room.description,
            basePrice: room.basePrice,
            totalGuests: room.totalGuests,
            totalUnits: room.totalUnits,
          },
          {
            headers: {
              Authorization: `Bearer ${session.data?.user.accessToken}`,
            },
          }
        );
        const roomId = createdRoom.id;

        if (room.roomImages.length > 0) {
          for (let i = 0; i < room.roomImages.length; i++) {
            const formData = new FormData();
            formData.append("urlImages", room.roomImages[i]);
            formData.append("isCover", i === 0 ? "true" : "false");

            await axiosInstance.post(`/rooms/${roomId}/room-images`, formData, {
              headers: {
                Authorization: `Bearer ${session.data?.user.accessToken}`,
              },
            });
          }
        }
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Create property successfully");
      router.push("/dashboard/tenant/property");
      queryClient.invalidateQueries({ queryKey: ["properties", "tenant"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create property");
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

export const useCheckPropertyPublishability = (propertyId: number) => {
  const session = useSession();

  return useQuery({
    queryKey: ["property", propertyId, "publishability"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        currentStatus: string;
        canPublish: boolean;
        checklist: {
          propertyImages: boolean;
          roomCreated: boolean;
          validRoom: boolean;
        };
      }>(`/properties/${propertyId}/publishability`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    enabled: !!propertyId && !!session.data?.user.accessToken,
  });
};

export const usePublishProperty = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (propertyId: number) => {
      const { data } = await axiosInstance.patch(
        `/properties/${propertyId}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: (_, propertyId) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      toast.success("Property published successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message ||
          "Failed to publish property. Please ensure all requirements are met."
      );
    },
  });
};

export const useUnpublishProperty = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (propertyId: number) => {
      const { data } = await axiosInstance.patch(
        `/properties/${propertyId}/unpublish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: (_, propertyId) => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      toast.success("Property unpublished successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to unpublish property"
      );
    },
  });
};
