import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface DocumentStats {
    totalEmployees: bigint;
    completionRate: number;
    totalDocuments: bigint;
}
export interface Employee {
    joinDate: Time;
    name: string;
    createdAt: Time;
    email: string;
    employeeId: string;
    phone: string;
    department: string;
}
export interface Document {
    documentType: DocumentType;
    fileName: string;
    fileSize: bigint;
    employeeId: string;
    blobId: ExternalBlob;
    uploadedAt: Time;
}
export interface UserProfile {
    name: string;
}
export enum DocumentType {
    passportPhoto = "passportPhoto",
    class10Marksheet = "class10Marksheet",
    bankStatement = "bankStatement",
    experienceCertificate = "experienceCertificate",
    panCard = "panCard",
    mastersDegree = "mastersDegree",
    aadharCard = "aadharCard",
    class12Marksheet = "class12Marksheet",
    bachelorsDegree = "bachelorsDegree",
    diplomaCertificate = "diplomaCertificate"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDocument(employeeId: string, documentType: DocumentType, blobId: ExternalBlob, fileName: string, fileSize: bigint): Promise<Document>;
    addEmployee(name: string, department: string, email: string, phone: string, joinDate: Time): Promise<Employee>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDocument(employeeId: string, documentType: DocumentType): Promise<void>;
    deleteEmployee(employeeId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocumentStats(): Promise<DocumentStats>;
    getDocuments(employeeId: string): Promise<Array<Document>>;
    getEmployee(employeeId: string): Promise<Employee | null>;
    getEmployees(): Promise<Array<Employee>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEmployee(employeeId: string, employee: Employee): Promise<Employee>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
}
