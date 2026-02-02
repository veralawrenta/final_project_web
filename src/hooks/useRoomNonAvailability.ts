import { axiosInstance } from "@/lib/axios";
import { PageableResponse, PaginationQueryParams } from "@/types/pagination";
import { RoomNonAvailability } from "@/types/room";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface GetRoomNonAvailabilityQuery extends PaginationQueryParams {
  search?: string;
}

export const useGetRoomNonAvailability = (
  queries: GetRoomNonAvailabilityQuery
) => {
  return useQuery({
    queryKey: ["roomNonAvailability", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        PageableResponse<RoomNonAvailability>
      >("/rooms-non-availability", { params: queries },);
      return data;
    },
  });
};

export const useGetRoomNonAvailabilityByRoom = (roomId: number) => {
  return useQuery({
    queryKey: ["roomNonAvailability", "room", roomId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<RoomNonAvailability[]>(
        `/rooms-non-availability/room/${roomId}`,
      );
      return data;
    },
    enabled: !!roomId,
  });
};

export const useCreateRoomNonAvailability = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async ({
      roomId,
      body,
    }: {
      roomId: number;
      body: {
        startDate: string;
        endDate: string;
        reason?: string;
        roomInventory: number;
      };
    }) => {
      const { data } = await axiosInstance.post(
        `/rooms-non-availability/room/${roomId}`,
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
      queryClient.invalidateQueries({ queryKey: ["roomNonAvailability"] });
      toast.success("Maintenance block created");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to create maintenance block"
      );
    },
  });
};

export const useUpdateRoomNonAvailability = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: {
        startDate?: string;
        endDate?: string;
        reason?: string;
        roomInventory?: number;
      };
    }) => {
      const { data } = await axiosInstance.patch(
        `/rooms-non-availability/${id}`,
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
      queryClient.invalidateQueries({ queryKey: ["roomNonAvailability"] });
      toast.success("Maintenance block updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to update maintenance block"
      );
    },
  });
};
export const useDeleteRoomNonAvailability = () => {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete(
        `/rooms-non-availability/${id}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomNonAvailability"] });
      toast.success("Maintenance block deleted");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to delete maintenance block"
      );
    },
  });
};
