import { axiosInstance } from "@/lib/axios";
import { changeEmailSchema } from "@/lib/validator/auth.change-email.schema";
import { changePasswordSchema } from "@/lib/validator/profile.change-password.schema";
import { updateDataUserSchema } from "@/lib/validator/profile.update-data.schema";
import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

interface Payload {
  avatar: File;
}

export const useMeProfile = () => {
  const session = useSession();
  return useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const accessToken = session.data?.user.accessToken;
      //console.log(
      //  `Fetching profile with token:', ${accessToken}  ? 'Token exists' : 'No token`
      //);
      const { data } = await axiosInstance.get<User>("users/me", {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!session.data?.user.accessToken,
  });
};

export const useUpdateProfileUser = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: z.infer<typeof updateDataUserSchema>) => {
      const { data } = await axiosInstance.patch<User>(
        "users/data-user",
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
      toast.success("Profile updated successfully");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["me-profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update profile");
    },
  });
};

export const useUpdateProfileTenant = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession()

  return useMutation({
    mutationFn: async (payload: {
      tenantName?: string;
      address?: string;
      aboutMe?: string;
      bankName?: string;
      bankNumber?: string;
    }) => {
      const { data } = await axiosInstance.patch("/users/data-tenant", payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
      toast.success("Tenant profile updated successfully");
      setTimeout(() => {
        router.refresh();
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to update tenant profile"
      );
    },
  });
};

export const useUploadAvatar = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();

      form.append("avatar", file);

      const { data } = await axiosInstance.post<{ avatar: string }>(
        "/users/me/avatar",
        form,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success("Upload avatar success");
      setTimeout(() => {
          router.refresh()
      }, 1000)
      queryClient.setQueryData(["me-profile"], (oldData: User | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            avatar: data.avatar,
          };
        }
        return oldData;
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update profile");
    },
  });
};

export const useResendVerification = () => {
  const router = useRouter();
  const session = useSession();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/resend-change-email", {}, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Verification email sent successfully");
      setTimeout(() => {
        router.refresh();
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data.message || "Failed to resend verification email"
      );
    },
  });
};
export const useChangeEmail = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: z.infer<typeof changeEmailSchema>) => {
      const { data } = await axiosInstance.post("/auth/change-email", body, {
        headers: { Authorization: `Bearer ${session.data?.user.accessToken}` },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Change email request sent successfully");
      queryClient.invalidateQueries({ queryKey: ["me-profile"] });
      setTimeout(() => {
        router.push("/profile/user");
      }, 1000);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to change email");
    },
  });
};

export const useChangePassword = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: z.infer<typeof changePasswordSchema>) => {
      const { data } = await axiosInstance.patch(
        "/auth/change-password",
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
      toast.success("Change password success");
      setTimeout(() => {
        router.push("/profile/user");
      }, 1000);
      queryClient.invalidateQueries({ queryKey: ["me-profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to update profile");
    },
  });
};
