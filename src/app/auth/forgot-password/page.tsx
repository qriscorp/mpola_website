"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "sent">("request");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const { register, handleSubmit } = useForm<{ value: string }>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep("sent");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B2B3A] via-[#1B2B3A] to-[#239E8C] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link
            href="/auth/signin"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
          {step === "request" ? (
            <>
              <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                Forgot Password?
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email or phone number and we&apos;ll send you a reset
                link.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-[#2BB5A0]" />
              <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                Check Your {method === "email" ? "Inbox" : "Phone"}
              </h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a password reset{" "}
                {method === "email" ? "link" : "code"} to your{" "}
                {method === "email" ? "email address" : "phone number"}.
              </p>
            </>
          )}
        </CardHeader>

        <CardContent>
          {step === "request" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Method Toggle */}
              <div className="flex rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                    method === "email"
                      ? "bg-[#2BB5A0] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                    method === "phone"
                      ? "bg-[#2BB5A0] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  {method === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="value"
                  type={method === "email" ? "email" : "tel"}
                  placeholder={
                    method === "email" ? "you@example.com" : "+256 7XX XXX XXX"
                  }
                  {...register("value", { required: true })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : `Send Reset ${method === "email" ? "Link" : "Code"}`}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("request")}
              >
                Try Again
              </Button>
              <Link
                href="/auth/signin"
                className="block text-sm text-[#2BB5A0] hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
