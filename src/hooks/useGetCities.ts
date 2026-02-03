import { axiosInstance } from "@/lib/axios";
import { City } from "@/types/city";
import { useQuery } from "@tanstack/react-query";

export const useGetCities = (search: string) => {
    return useQuery({
      queryKey: ["cities", search],
      queryFn: async () => {
        const { data } = await axiosInstance.get<City[]>("/cities", {
          params: search ? { search } : {},
        });
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });
  };