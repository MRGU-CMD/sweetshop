import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddressesClient from "./AddressesClient";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: (session.user as any).id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">📍 收货地址</h2>
      <AddressesClient addresses={addresses} />
    </div>
  );
}
