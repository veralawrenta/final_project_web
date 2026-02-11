import { Role } from "@/types/user";
import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response?.status === 401 && !originalRequest.url?.includes("/auth/verify-change-email")) {
      const session = await getSession();
      const role = session?.user?.role;

      toast.error("Session expired. Please login again.")

      const loginUrl =
        role === Role.TENANT ? "/auth/login/tenant" : "/auth/login/user";
      await signOut({ callbackUrl: loginUrl });
    };
    return Promise.reject(error);
  },
);
