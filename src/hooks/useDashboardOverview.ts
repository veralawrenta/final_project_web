import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface DashboardData {
    profile: {
      name: string;
      avatar: string | null;
    };
    stats: {
      totalProperties: number;
      totalRooms: number;
      totalRoomNonAvailability: number;
      averageRating: number | null;
    };
  }

export const useDashboardOverview = () => {
    const session = useSession();
    return useQuery({
        queryKey: ["dashboard-overview"],
        queryFn: async () => {
          const { data } = await axiosInstance.get<DashboardData>(
            "/tenants/me/statistics", {
                headers: {
                  Authorization: `Bearer ${session.data?.user.accessToken}`,
                },
            },
          );
          return data;
        },
      });
}