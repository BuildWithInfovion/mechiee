import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-60">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

