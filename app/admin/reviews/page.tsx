import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewsIcon } from "@/components/admin/AdminIcons";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ReviewsIcon /> 评价管理</h1>
      <AdminReviewsClient />
    </div>
  );
}
