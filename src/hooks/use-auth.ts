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
    onError: () => {
      toast.error("Invalid credentials. Please try again.");
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
    onError: () => {
      toast.error("Registration failed. Please try again.");
    },
  });
}
