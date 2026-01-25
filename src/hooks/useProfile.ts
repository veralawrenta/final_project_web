import { axiosInstance } from "@/lib/axios";
import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  avatar: File;
}

export const useMeProfile = () => {
  return useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("users/me");
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      const { data } = await axiosInstance.patch<User>(
        "users/data-user",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      router.push("/dashboard/user/profile");
      queryClient.invalidateQueries({ queryKey: ["me-profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update profile");
    },
  });
};

export const useUploadAvatar = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const form = new FormData();

      form.append("avatar", payload.avatar);

      await axiosInstance.post("/users/me/avatar", form, {
        headers: { Authorization: `Bearer ${session.data?.user.accessToken}` },
      });
    },
    onSuccess: () => {
      toast.success("Upload avatar success");
      router.push("/dashboard/user/profile");
      queryClient.invalidateQueries({ queryKey: ["me-profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update profile");
    },
  });
};

export const useResendVerification = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/resend-change-email");
      return data;
    },
    onSuccess: () => {
      toast.success("Verification email sent successfully");
      router.refresh();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to resend verification email"
      );
    },
  });
};
