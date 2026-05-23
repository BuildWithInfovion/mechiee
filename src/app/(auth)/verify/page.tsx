"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/shared/OtpInput";
import { toast } from "@/hooks/use-toast";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(false);

  async function handleVerify(otp: string) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid OTP");
      if (data.needs_onboarding) {
        router.push("/onboard");
      } else {
        router.push(data.redirect ?? "/");
      }
    } catch (err) {
      setError(true);
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to resend");
      toast.success("OTP sent!", "Check your messages");
    } catch {
      toast.error("Could not resend OTP");
    } finally {
      setResending(false);
    }
  }

  const displayPhone = phone.replace("+91", "").replace(/(\d{5})(\d{5})/, "$1 $2");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Verify your number</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to{" "}
            <span className="text-foreground font-medium">+91 {displayPhone}</span>
          </p>
        </div>

        <div className="space-y-6">
          <OtpInput
            length={6}
            onComplete={handleVerify}
            disabled={loading}
            error={error}
          />

          {loading && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Verifying...
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-destructive">
              Invalid OTP. Please try again.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Didn&apos;t receive?</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resending}
            className="text-primary hover:text-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Sending..." : "Resend OTP"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyForm />
    </Suspense>
  );
}
