import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/crm/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar userEmail={user?.email} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
