import { axiosInstance } from "@/lib/axios";
import {
  createRoomSchema,
  updateRoomSchema,
  uploadRoomImagesSchema,
} from "@/lib/validator/dashboard.rooms.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

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

export const useGetTenantRooms = () => {
  const session = useSession();
  return useQuery({
    queryKey: ["tenantRooms"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/rooms/", {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();

  return useMutation({
    mutationFn: async (body: z.infer<typeof createRoomSchema>) => {
      const propertyId = Number(body.propertyId);
      const formData = new FormData();
      formData.append("name", body.name);
      formData.append("description", body.description);
      formData.append("basePrice", body.basePrice.toString());
      formData.append("totalGuests", body.totalGuests.toString());
      formData.append("totalUnits", body.totalUnits.toString());

      const { data } = await axiosInstance.post(
        `/rooms/property/${propertyId}`,
        formData,
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
      toast.success("Room created successfully");
      setTimeout(() => {
        router.push("/dashboard/tenant/room");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create room");
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
      const formData = new FormData();
      if (body.name) formData.append("name", body.name);
      if (body.description) formData.append("description", body.description);
      if (body.basePrice !== undefined)
        formData.append("basePrice", body.basePrice.toString());
      if (body.totalGuests !== undefined)
        formData.append("totalGuests", body.totalGuests.toString());
      if (body.totalUnits !== undefined)
        formData.append("totalUnits", body.totalUnits.toString());

      const { data } = await axiosInstance.patch(`/rooms/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      queryClient.invalidateQueries({ queryKey: ["getproperties"] });
      toast.success("Tenant profile updated successfully");
      setTimeout(() => {
        router.push("/dashboard/tenant/room");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to update tenant profile"
      );
    },
  });
};

export const useUploadRoomImages = () => {
  const queryClient = useQueryClient();
  const session = useSession();
  const router = useRouter();

  const params = useParams();
  const roomId = Number(params.id);

  return useMutation({
    mutationFn: async (body : z.infer<typeof uploadRoomImagesSchema>) => {
      const formData = new FormData();
      body.roomImages.forEach((image) => {
        formData.append("roomImages", image);
      });
      const { data } = await axiosInstance.post(`/room-images/room/${roomId}`, formData, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      toast.success("Room Images uploaded successfully");
      setTimeout(() => {
        router.push("/dashboard/tenant/room");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to upload images");
    },
  });
};

export const useUpdateRoomImage = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  const params = useParams();
  const roomImageId = Number(params.id);

  return useMutation({
    mutationFn: async (isCover: boolean) => {
      const { data } = await axiosInstance.patch(
        `/room-images/${roomImageId}/cover`,
        { isCover },
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
      toast.success("Room image updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update room image");
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
      toast.error(error.response?.data.message || "Failed to delete room image");
    },
  });
}
