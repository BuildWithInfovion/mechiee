"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ length = 6, onComplete, disabled, error }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = useCallback((idx: number) => {
    inputs.current[idx]?.focus();
  }, []);

  function handleChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < length - 1) focus(idx + 1);
    if (next.every(Boolean)) onComplete(next.join(""));
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !values[idx] && idx > 0) focus(idx - 1);
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array(length).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setValues(next);
    if (pasted.length === length) onComplete(pasted);
    else focus(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "otp-input",
            error && "border-destructive ring-destructive/30"
          )}
        />
      ))}
    </div>
  );
}
