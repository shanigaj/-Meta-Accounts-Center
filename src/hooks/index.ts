"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/http";
import type {
  ActivityPage,
  ActivityType,
  AdminUser,
  ConnectedAccount,
  Dashboard,
  Privacy,
  Provider,
  Security,
  SessionInfo,
  User,
} from "@/lib/types";

// Query keys kept in one spot so invalidation stays consistent.
export const keys = {
  me: ["me"] as const,
  dashboard: ["dashboard"] as const,
  profile: ["profile"] as const,
  accounts: ["accounts"] as const,
  security: ["security"] as const,
  sessions: ["sessions"] as const,
  devices: ["devices"] as const,
  privacy: ["privacy"] as const,
  adminUsers: ["admin", "users"] as const,
  activity: (type: string, page: number) => ["activity", type, page] as const,
};

/* ---------------------------------- auth --------------------------------- */

export function useMe() {
  return useQuery({ queryKey: keys.me, queryFn: () => api.get<User>("/api/auth/me") });
}

/* -------------------------------- dashboard ------------------------------ */

export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: () => api.get<Dashboard>("/api/dashboard"),
  });
}

/* --------------------------------- profile ------------------------------- */

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: () => api.get<User>("/api/profile") });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<User>) => api.patch<User>("/api/profile", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.profile });
      qc.invalidateQueries({ queryKey: keys.dashboard });
      qc.invalidateQueries({ queryKey: keys.me });
    },
  });
}

/* ---------------------------- connected accounts ------------------------- */

export function useAccounts() {
  return useQuery({
    queryKey: keys.accounts,
    queryFn: () => api.get<ConnectedAccount[]>("/api/accounts"),
  });
}

export function useConnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { provider: Provider; providerUsername: string }) =>
      api.post<ConnectedAccount>("/api/accounts", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.accounts });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

export function useRemoveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/accounts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.accounts });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

/* --------------------------------- security ------------------------------ */

export function useSecurity() {
  return useQuery({
    queryKey: keys.security,
    queryFn: () => api.get<Security>("/api/security"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api.patch("/api/security/password", input),
  });
}

export function useToggleTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      api.patch("/api/security/two-factor", { enabled }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.security });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

// Mock email verification: request a token then confirm it in one go. In a real
// app the confirm step would happen when the user clicks the emailed link.
export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { token } = await api.post<{ token: string }>(
        "/api/auth/verify-email/request"
      );
      return api.post("/api/auth/verify-email/confirm", { token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.security });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: keys.sessions,
    queryFn: () => api.get<SessionInfo[]>("/api/security/sessions"),
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/security/sessions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sessions });
      qc.invalidateQueries({ queryKey: keys.devices });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

export function useLogoutAll() {
  return useMutation({ mutationFn: () => api.post("/api/security/logout-all") });
}

/* --------------------------------- devices ------------------------------- */

export function useDevices() {
  return useQuery({
    queryKey: keys.devices,
    queryFn: () => api.get<SessionInfo[]>("/api/devices"),
  });
}

export function useRemoveDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/devices/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.devices });
      qc.invalidateQueries({ queryKey: keys.sessions });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

/* --------------------------------- privacy ------------------------------- */

export function usePrivacy() {
  return useQuery({
    queryKey: keys.privacy,
    queryFn: () => api.get<Privacy>("/api/privacy"),
  });
}

// Optimistic: flip the toggle immediately, roll back if the request fails.
export function useUpdatePrivacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Privacy>) => api.patch<Privacy>("/api/privacy", patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: keys.privacy });
      const previous = qc.getQueryData<Privacy>(keys.privacy);
      if (previous) {
        qc.setQueryData<Privacy>(keys.privacy, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.previous) qc.setQueryData(keys.privacy, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.privacy });
    },
  });
}

/* ---------------------------------- admin -------------------------------- */

// RBAC-gated. The API returns 403 for non-admins; the page also hides itself.
export function useAdminUsers(enabled: boolean) {
  return useQuery({
    queryKey: keys.adminUsers,
    queryFn: () => api.get<AdminUser[]>("/api/admin/users"),
    enabled,
  });
}

/* --------------------------------- activity ------------------------------ */

export function useActivity(type: ActivityType | "ALL", page: number) {
  return useQuery({
    queryKey: keys.activity(type, page),
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (type !== "ALL") params.set("type", type);
      return api.get<ActivityPage>(`/api/activity?${params.toString()}`);
    },
    placeholderData: (prev) => prev,
  });
}
