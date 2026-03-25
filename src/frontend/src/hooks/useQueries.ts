import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { DocumentType, Employee } from "../backend.d";
import { useActor } from "./useActor";

export function useGetEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useGetDocuments(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["documents", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDocuments(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useGetDocumentStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["documentStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDocumentStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      department: string;
      email: string;
      phone: string;
      joinDate: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addEmployee(
        data.name,
        data.department,
        data.email,
        data.phone,
        data.joinDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      employee,
    }: { employeeId: string; employee: Employee }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEmployee(employeeId, employee);
    },
    onSuccess: (
      _data: Employee,
      { employeeId }: { employeeId: string; employee: Employee },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEmployee(employeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
    },
  });
}

export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      documentType,
      file,
      onProgress,
    }: {
      employeeId: string;
      documentType: DocumentType;
      file: File;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) blob = blob.withUploadProgress(onProgress);
      return actor.addDocument(
        employeeId,
        documentType,
        blob,
        file.name,
        BigInt(file.size),
      );
    },
    onSuccess: (
      _data: unknown,
      {
        employeeId,
      }: {
        employeeId: string;
        documentType: DocumentType;
        file: File;
        onProgress?: (pct: number) => void;
      },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      documentType,
    }: { employeeId: string; documentType: DocumentType }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteDocument(employeeId, documentType);
    },
    onSuccess: (
      _data: unknown,
      { employeeId }: { employeeId: string; documentType: DocumentType },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
    },
  });
}
