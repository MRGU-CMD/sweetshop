export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import { AccountIcon } from "@/components/user/UserIcons";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, nickname: true, avatar: true, phone: true, email: true, role: true, createdAt: true },
  });

  const bindings = await prisma.userBinding.findMany({
    where: { userId: session.user.id },
  });

  const serializedUser = user ? { ...user, createdAt: user.createdAt.toISOString() } : null;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><AccountIcon /> 账号设置</h2>
      <AccountClient user={serializedUser!} bindings={bindings} />
    </div>
  );
}
