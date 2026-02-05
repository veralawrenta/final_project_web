import { axiosInstance } from "@/lib/axios";
import {
  CreateRoomFormData,
  updateRoomSchema,
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
    queryKey: ["tenant-rooms", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Room>>(
        "/rooms/",
        { params: queries }
      );
      return data;
    },
  });
};

export const usetGetAvailableRooms = (checkIn?: string, checkOut?: string) => {
  const params = useParams();
  const propertyId = Number(params.propertyId);

  return useQuery({
    queryKey: ["available-rooms", propertyId, checkIn, checkOut],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Room>(
        `/properties/${propertyId}/rooms`
      );
      return data;
    },
  });
};

export const useGetRoomsProperty = () => {
  const session = useSession();
  const params = useParams();
  const propertyId = Number(params.propertyId);

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
    enabled: !!session.data?.user.accessToken,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateRoom = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      propertyId,
      room,
    }: {
      propertyId: number;
      room: CreateRoomFormData;
    }) => {
      toast.loading("Creating room with images...", { id: "create-room" });

      const formData = new FormData();

      formData.append("name", room.name);
      formData.append("description", room.description);
      formData.append("basePrice", room.basePrice.toString());
      formData.append("totalGuests", room.totalGuests.toString());
      formData.append("totalUnits", room.totalUnits.toString());
      room.urlImages.forEach((file) => {
        formData.append("urlImages", file);
      });

      const response = await axiosInstance.post(
        `/rooms/property/${propertyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-rooms"] });
      toast.success("Room created successfully", { id: "create-room" });
      router.push("/dashboard/tenant/room");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create room", {
        id: "create-room",
      });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

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

      const response = await axiosInstance.patch(`/rooms/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      queryClient.invalidateQueries({ queryKey: ["getproperties"] });
      router.push("/dashboard/tenant/room");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update room", {
        id: "update-room",
      });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const response = await axiosInstance.delete(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-rooms"] });
      toast.success("Room deleted successfully!", { id: "delete-room" });
      setTimeout(()=> {
        router.push("/dashboard/tenant");
      }, 1000)
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to delete room", {id: "delete-room"});
    },
  });
};

export const useUploadRoomImages = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      roomId,
      images,
    }: {
      roomId: number;
      images: File[];
    }) => {
      if (images.length === 0) { throw new Error("No images to upload")};
      const roomResponse = await axiosInstance.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });

      const existingImagesCount = roomResponse.data.roomImages?.length || 0;
      const uploadPromises = images.map(async (file, index) => {
        const formData = new FormData();
        formData.append("urlImage", file);
        formData.append("isCover", String(existingImagesCount === 0 && index === 0));

        return axiosInstance.post(`/room-images/room/${roomId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        });
      });
      await  Promise.all(uploadPromises); //wait for all to upload completely
      return { roomId, uploadedCount: images.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      toast.success(`${data.uploadedCount} image(s) uploaded successfully!`)
    },
    onError: (error: AxiosError<{ message: string }>) => { toast.error(error.response?.data.message || "Failed to upload images" )},
    });
};

export const useDeleteRoomImage = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomImageId: number) => {
      const response = await axiosInstance.delete(
        `/room-images/${roomImageId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-rooms"] });
      toast.success("Room image deleted successfully");
      setTimeout(() => {
        router.push("/dashboard/tenant/room")
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to delete room image"
      );
    },
  });
};
