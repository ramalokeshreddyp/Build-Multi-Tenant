import { create } from "zustand";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type LoginRequest, type RegisterTenantRequest } from "@shared/routes";
import { User, Tenant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  setToken: (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));

// Helper to get headers with token
export const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export function useAuth() {
  const { token, setToken, logout } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData, isLoading: isLoadingUser } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      if (!token) return null;
      const res = await fetch(api.auth.me.path, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error("Unauthorized");
      }
      return api.auth.me.responses[200].parse(await res.json());
    },
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData([api.auth.me.path], { user: data.user, tenant: data.tenant });
      toast({ title: "Welcome back!", description: `Logged in as ${data.user.fullName}` });
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterTenantRequest) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData([api.auth.me.path], { user: data.user, tenant: data.tenant });
      toast({ title: "Welcome!", description: "Your workspace has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  return {
    user: authData?.user,
    tenant: authData?.tenant,
    isLoading: isLoadingUser,
    isAuthenticated: !!authData?.user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
