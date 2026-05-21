import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  return <AdminOrdersClient />;
}
