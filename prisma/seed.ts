import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sweetshop.com" },
    update: {},
    create: {
      nickname: "管理员",
      email: "admin@sweetshop.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const categories = [
    { name: "手办模型", slug: "figures", sort: 1, icon: "🎀" },
    { name: "服饰周边", slug: "clothing", sort: 2, icon: "👕" },
    { name: "漫画轻小说", slug: "manga", sort: 3, icon: "📚" },
    { name: "游戏周边", slug: "games", sort: 4, icon: "🎮" },
    { name: "彩妆护肤", slug: "cosmetics", sort: 5, icon: "💄" },
    { name: "数码配件", slug: "digital", sort: 6, icon: "🎧" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const figuresCat = await prisma.category.findUnique({ where: { slug: "figures" } });
  if (figuresCat) {
    const products = [
      { name: "GSC 猫娘 Q版 黏土人 限定特典版", price: 199, originalPrice: 299, stock: 128, sales: 2341, source: "原创" },
      { name: "鬼灭之刃 炭治郎 1/8 PVC 涂装完成品", price: 599, originalPrice: 799, stock: 45, sales: 892, source: "鬼灭之刃" },
      { name: "Re:Zero 雷姆 女仆装 1/7 PVC", price: 899, originalPrice: 1099, stock: 23, sales: 567, source: "Re:Zero" },
      { name: "咒术回战 五条悟 figma 可动", price: 459, stock: 67, sales: 1234, source: "咒术回战" },
    ];
    for (const p of products) {
      await prisma.product.create({
        data: { ...p, categoryId: figuresCat.id, images: "[]" },
      });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
