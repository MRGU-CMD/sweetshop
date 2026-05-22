import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AftersaleIcon } from "@/components/admin/AdminIcons";
import AdminAfterSaleClient from "./AdminAfterSaleClient";

export default async function AdminAfterSalePage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><AftersaleIcon /> 售后管理</h1>
      <AdminAfterSaleClient />
    </div>
  );
}
