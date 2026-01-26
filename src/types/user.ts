export enum Role {
    USER = "USER",
    TENANT="TENANT",
}

export interface User {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: string;
    aboutMe?: string;
    provider?: "GOOGLE" | "CREDENTIAL"
    isVerified? : boolean;
    role: Role;
    token?: string | null;
    expiredAt?: string| null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
}

export interface Tenant {
    id: number;
    user: User;
    tenantName: string;
    imageUrl?: string;
    bankNumber: string;
    bankName: string;
}