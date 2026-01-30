import { axiosInstance } from "@/lib/axios";
import {
  createRoomSchema,
  updateRoomSchema,
  uploadRoomImagesSchema,
} from "@/lib/validator/dashboard.rooms.schema";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import { Room } from "@/types/room";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

interface GetTenantRoomsQuery extends PaginationQueryParams {
  search?: string;
}

export const useGetTenantRooms = (queries?: GetTenantRoomsQuery) => {
  const session = useSession();
  return useQuery({
    queryKey: ["tenantRooms", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Room>>(
        "/rooms/",
        { params: queries }
      );
      return data;
    },
  });
};

export const useGetRoomsProperty = () => {
  const session = useSession();
  const params = useParams();
  const propertyId = Number(params.id);

  return useQuery({
    queryKey: ["getrooms"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/rooms/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();

  return useMutation({
    mutationFn: async (body: z.infer<typeof createRoomSchema>) => {
      const propertyId = Number(body.propertyId);
      const { data } = await axiosInstance.post(
        `/rooms/property/${propertyId}`,
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
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      queryClient.invalidateQueries({ queryKey: ["getproperties"] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();

  const params = useParams();
  const id = Number(params.id);

  return useMutation({
    mutationFn: async (body: z.infer<typeof updateRoomSchema>) => {
      //create form data secara parsial
      const payload: Record<string, unknown> = {};
      if (body.name !== undefined) payload.name = body.name;
      if (body.description !== undefined)
        payload.description = body.description;
      if (body.basePrice !== undefined) payload.basePrice = body.basePrice;
      if (body.totalGuests !== undefined)
        payload.totalGuests = body.totalGuests;
      if (body.totalUnits !== undefined) payload.totalUnits = body.totalUnits;

      const { data } = await axiosInstance.patch(`/rooms/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      queryClient.invalidateQueries({ queryKey: ["getproperties"] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const { data } = await axiosInstance.delete(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      router.push("/dashboard/tenant/rooms");
    },
  });
};

export const useDeleteRoomImage = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  const params = useParams();
  const roomImageId = Number(params.id);

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.delete(
        `/room-images/${roomImageId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      toast.success("Room image deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to delete room image"
      );
    },
  });
};
