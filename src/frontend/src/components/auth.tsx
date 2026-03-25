import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut } from "lucide-react";
import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function useAuthState() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  return {
    isAuthenticated: !!identity,
    isLoggingIn: loginStatus === "logging-in",
    isInitializing,
    identity,
  };
}

export function AuthButton({
  variant = "default",
}: { variant?: "default" | "outline" | "ghost" }) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleAuth}
      disabled={isLoggingIn}
      data-ocid="auth.button"
    >
      {isLoggingIn ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isAuthenticated ? (
        <LogOut className="mr-2 h-4 w-4" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      {isLoggingIn ? "Signing in..." : isAuthenticated ? "Sign Out" : "Sign In"}
    </Button>
  );
}
