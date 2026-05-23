import { BottomNav } from "@/components/shared/BottomNav";
import { Toaster } from "@/components/ui/toaster";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
      <Toaster />
    </>
  );
}
