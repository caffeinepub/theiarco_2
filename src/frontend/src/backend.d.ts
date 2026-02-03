import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Publisher {
    id: PublisherId;
    privileges: {
        servant: boolean;
        publisher: boolean;
        elder: boolean;
    };
    fieldServiceGroup: bigint;
    fullName: string;
    isGroupOverseer: boolean;
    isActive: boolean;
    notes: string;
    isGroupAssistant: boolean;
}
export type PublisherId = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPublisher(fullName: string, fieldServiceGroup: bigint, privileges: {
        servant: boolean;
        publisher: boolean;
        elder: boolean;
    }, isGroupOverseer: boolean, isGroupAssistant: boolean, isActive: boolean | null, notes: string | null): Promise<PublisherId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePublisher(id: PublisherId): Promise<void>;
    getAllPublishers(): Promise<Array<Publisher>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPublisher(id: PublisherId): Promise<Publisher | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    togglePublisherActiveState(id: PublisherId): Promise<void>;
    updatePublisher(id: PublisherId, fullName: string, fieldServiceGroup: bigint, privileges: {
        servant: boolean;
        publisher: boolean;
        elder: boolean;
    }, isGroupOverseer: boolean, isGroupAssistant: boolean, isActive: boolean): Promise<void>;
}
