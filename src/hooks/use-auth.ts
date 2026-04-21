"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  SignInFormData,
  RegisterIndividualFormData,
  RegisterBusinessFormData,
} from "@/lib/schemas";

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: SignInFormData) =>
      api.signIn({ phoneOrEmail: data.phoneOrEmail, password: data.password }),
    onSuccess: () => {
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials. Please try again.");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: RegisterIndividualFormData | RegisterBusinessFormData) =>
      api.register(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success("Account created successfully!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

export function useLenderSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: { phoneOrEmail: string; password: string }) =>
      api.lenderSignIn(data),
    onSuccess: () => {
      toast.success("Welcome back!");
      router.push("/lender");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials. Please try again.");
    },
  });
}

export function useLenderRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.lenderRegister(data),
    onSuccess: () => {
      toast.success("Lender account created!");
      router.push("/lender");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  return () => {
    api.signOut();
    router.push("/");
  };
}
