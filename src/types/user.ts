export enum Role {
    USER = "USER",
    TENANT="TENANT",
}

export interface User {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    address?: string;
    imageUrl?: string;
    aboutMe?: string;
    role: Role;
    token?: string | null;
    expiredAt?: string| null;
    isVerified: boolean;
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