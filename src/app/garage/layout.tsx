import { GarageSidebar } from "@/components/shared/GarageSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function GarageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <GarageSidebar />
      <main className="flex-1 md:ml-60">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
