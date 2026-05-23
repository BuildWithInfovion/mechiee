"use client";

import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

interface ToastItem extends Omit<ToastProps, "id"> {
  id: string;
  title?: string;
  description?: string;
}

type ToastInput = Omit<ToastItem, "id">;

const toastState = {
  toasts: [] as ToastItem[],
  listeners: new Set<() => void>(),
  notify() {
    this.listeners.forEach((l) => l());
  },
  add(toast: ToastInput) {
    const id = String(Date.now());
    this.toasts = [{ ...toast, id }, ...this.toasts].slice(0, 3);
    this.notify();
    setTimeout(() => this.remove(id), 4000);
  },
  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  },
};

export function toast(input: ToastInput) {
  toastState.add(input);
}

toast.success = (title: string, description?: string) =>
  toastState.add({ title, description, variant: "success" });
toast.error = (title: string, description?: string) =>
  toastState.add({ title, description, variant: "destructive" });

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(toastState.toasts);

  React.useEffect(() => {
    const update = () => setToasts([...toastState.toasts]);
    toastState.listeners.add(update);
    return () => { toastState.listeners.delete(update); };
  }, []);

  return { toasts };
}
