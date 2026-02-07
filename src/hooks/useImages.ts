import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useUploadPropertyImage = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      propertyId,
      file,
      isCover,
    }: {
      propertyId: number;
      file: File;
      isCover: boolean;
    }) => {
      const formData = new FormData();
      formData.append("urlImages", file);
      formData.append("isCover", isCover.toString());

      const { data } = await axiosInstance.post(
        `/property-images/properties/${propertyId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property"] });
      toast.success("The images upload successfully");
      setTimeout(() => {
        router.push("/dashboard/tenant/property");
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message ||
          "Failed to upload image for this property"
      );
    },
  });
};

export const useUploadRoomImage = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      roomId,
      file,
      isCover,
    }: {
      roomId: number;
      file: File;
      isCover: boolean;
    }) => {
      const formData = new FormData();
      formData.append("urlImages", file);
      formData.append("isCover", isCover.toString());

      const { data } = await axiosInstance.post(
        `/room-images/rooms/${roomId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", variables.roomId] });
      toast.success("Room images upload successfully");
      setTimeout(() => {
        router.push("/dashboard/tenant/property");
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to upload image for this room"
      );
    },
  });
};

export const useDeletePropertyImage = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (propertyImageId: number) => {
      const { data } = await axiosInstance.delete(
        `/property-images/${propertyImageId}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property"] });
      toast.success("Property image deleted successfully");
      setTimeout(() => {
        router.refresh();
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to delete image");
    },
  });
};

export const useDeleteRoomImage = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomImageId: number) => {
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Property image deleted successfully");
      setTimeout(() => {
        router.refresh();
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to delete image");
    },
  });
};
