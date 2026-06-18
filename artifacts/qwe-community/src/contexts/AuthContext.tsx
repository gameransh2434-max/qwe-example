import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("qwe_token"));
  const [user, setUser] = useState<User | null>(null);

  // Only fetch /me on page reload (token in localStorage but no user in React state yet)
  // After login(), user is already set so we skip this call entirely → no loop
  const { data: fetchedUser, isLoading, error, refetch } = useGetMe({
    query: {
      queryKey: [`/api/auth/me`],
      enabled: !!token && !user,
      retry: false,
      staleTime: Infinity,
    }
  });

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);

  useEffect(() => {
    if (error) {
      // Only clear session if the token is actually rejected (401/403)
      // Ignore network errors or other transient failures
      const status = (error as any)?.response?.status ?? (error as any)?.status ?? 0;
      if (status === 401 || status === 403) {
        logout();
      }
    }
  }, [error]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("qwe_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("qwe_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = () => {
    refetch();
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        isLoading: !!token && isLoading && !user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
