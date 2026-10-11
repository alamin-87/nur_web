import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdminUser();

  // If not logged in, we render the children directly (which is /admin/login or handled via Client Shell)
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-ink antialiased">
      <AdminShell user={user ? { name: user.name, email: user.email, role: user.role, avatar: user.avatar } : null}>
        {children}
      </AdminShell>
    </div>
  );
}
