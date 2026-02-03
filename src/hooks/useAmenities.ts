import { axiosInstance } from "@/lib/axios";
import { MasterAmenity } from "@/types/amenity";
import { useQuery } from "@tanstack/react-query";

export const useGetMasterAmenities = () => {
    return useQuery({
      queryKey: ["master-amenities"],
      queryFn: async () => {
        const { data } = await axiosInstance.get<MasterAmenity[]>("/amenities/master");
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
  
  export const useGetPropertyAmenities = (propertyId: number) => {
    return useQuery({
      queryKey: ["property-amenities", propertyId],
      queryFn: async () => {
        const { data } = await axiosInstance.get<MasterAmenity[]>(
          `/amenities/property/${propertyId}`
        );
        return data;
      },
      enabled: !!propertyId,
      staleTime: 5 * 60 * 1000,
    });
  };