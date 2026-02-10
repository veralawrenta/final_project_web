import {NextRequest, NextResponse} from "next/server";

const protectedRoutes = ["/auth/set-password", ["auth/f"]]

export { auth as middleware } from "@/auth";




