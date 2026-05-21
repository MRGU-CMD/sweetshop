import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !isAdminRole(role)) redirect("/");

  return <AdminUsersClient currentUserRole={role as string} />;
}
