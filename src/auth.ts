import { axiosInstance } from "@/lib/axios";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: "USER" | "TENANT";
    accessToken?: string;
  }
  interface Session {
    user: User;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      async authorize(user: any) {
        if (!user) return null;
        return user;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        console.log("ACCOUNT OBJECT:", account);

        if (!account.id_token) {
          console.error("Missing Google id_token");
          return false;
        }
        const { data } = await axiosInstance.post("/oauth/google", {
          googleToken: account?.id_token!,
        });

        user.id = data.id;
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.email = data.email;
        user.role = data.role;
        user.accessToken = data.accessToken;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
});
