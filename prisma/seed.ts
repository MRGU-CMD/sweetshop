import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const demoPassword = process.env.SEED_DEMO_PASSWORD || "123456";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: "admin@sweetshop.com" },
    update: { role: "OWNER", nickname: "站主" },
    create: { nickname: "站主", email: "admin@sweetshop.com", passwordHash: adminHash, role: "OWNER" },
  });

  const userHash = await bcrypt.hash(demoPassword, 10);
  await prisma.user.upsert({
    where: { email: "demo@sweetshop.com" },
    update: {},
    create: { nickname: "小樱", email: "demo@sweetshop.com", passwordHash: userHash, role: "USER" },
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
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }

  const productData: Record<string, { name: string; price: number; originalPrice?: number; stock: number; sales: number; source?: string }[]> = {
    figures: [
      { name: "GSC 猫娘 Q版 黏土人 限定特典版", price: 199, originalPrice: 299, stock: 128, sales: 2341, source: "原创" },
      { name: "鬼灭之刃 灶门炭治郎 1/8 PVC 涂装完成品", price: 599, originalPrice: 799, stock: 45, sales: 892, source: "鬼灭之刃" },
      { name: "Re:Zero 雷姆 女仆装 1/7 PVC", price: 899, originalPrice: 1099, stock: 23, sales: 567, source: "Re:Zero" },
      { name: "咒术回战 五条悟 figma 可动", price: 459, stock: 67, sales: 1234, source: "咒术回战" },
      { name: "初音未来 十周年纪念 1/7 PVC", price: 1299, originalPrice: 1599, stock: 15, sales: 345, source: "Vocaloid" },
      { name: "间谍过家家 阿尼亚 黏土人", price: 329, stock: 89, sales: 678, source: "间谍过家家" },
      { name: "新世纪福音战士 绫波丽 1/6 PVC", price: 1099, originalPrice: 1299, stock: 12, sales: 234, source: "EVA" },
    ],
    clothing: [
      { name: "樱花和风羽织 剑心款 男女同款", price: 299, stock: 56, sales: 1567, source: "浪客剑心" },
      { name: "鬼灭之刃 炭治郎 羽织披风", price: 189, originalPrice: 259, stock: 234, sales: 2345, source: "鬼灭之刃" },
      { name: "咒术回战 东京校 连帽卫衣", price: 239, stock: 178, sales: 890, source: "咒术回战" },
      { name: "间谍过家家 彭德 印花T恤", price: 129, stock: 345, sales: 1234, source: "间谍过家家" },
      { name: "初音未来 联名款 针织开衫", price: 359, originalPrice: 459, stock: 45, sales: 567, source: "Vocaloid" },
      { name: "进击的巨人 调查兵团 斗篷", price: 259, stock: 123, sales: 789, source: "进击的巨人" },
    ],
    manga: [
      { name: "鬼灭之刃 漫画 全套23册 简体中文", price: 299, originalPrice: 460, stock: 345, sales: 3456, source: "鬼灭之刃" },
      { name: "咒术回战 漫画 1-25册 限定封面", price: 328, stock: 234, sales: 1234, source: "咒术回战" },
      { name: "间谍过家家 漫画 1-14册 套装", price: 189, stock: 456, sales: 2345, source: "间谍过家家" },
      { name: "排球少年 漫画 全套45册", price: 599, originalPrice: 780, stock: 67, sales: 678, source: "排球少年" },
      { name: "电锯人 漫画 1-18册 台版", price: 339, stock: 123, sales: 890, source: "电锯人" },
    ],
    games: [
      { name: "原神 甘雨 1/7 霜华矢 限定版", price: 1599, originalPrice: 1899, stock: 8, sales: 456, source: "原神" },
      { name: "明日方舟 阿米娅 手办 企鹅物流", price: 699, stock: 34, sales: 789, source: "明日方舟" },
      { name: "蔚蓝档案 白子 1/7 PVC", price: 899, originalPrice: 1099, stock: 21, sales: 345, source: "蔚蓝档案" },
      { name: "崩坏：星穹铁道 丹恒 手办", price: 799, stock: 56, sales: 567, source: "崩坏：星穹铁道" },
      { name: "Nintendo Switch 塞尔达传说 限定Pro手柄", price: 459, stock: 78, sales: 1234 },
      { name: "原神 璃月·钟离 主题机械键盘", price: 699, stock: 45, sales: 678, source: "原神" },
    ],
    cosmetics: [
      { name: "初音未来 联名款 樱花唇釉 03号", price: 89, stock: 567, sales: 3456, source: "Vocaloid" },
      { name: "美少女战士 月光权杖 眼影盘", price: 199, originalPrice: 259, stock: 234, sales: 1234, source: "美少女战士" },
      { name: "魔卡少女樱 封印之杖 腮红刷套装", price: 149, stock: 345, sales: 890, source: "魔卡少女樱" },
      { name: "Hello Kitty 联名 保湿面膜 5片装", price: 79, stock: 678, sales: 2345 },
    ],
    digital: [
      { name: "鬼灭之刃 日轮刀 无线充电器", price: 129, stock: 234, sales: 1567, source: "鬼灭之刃" },
      { name: "初音未来 联名款 蓝牙耳机 TWS", price: 399, originalPrice: 499, stock: 89, sales: 678, source: "Vocaloid" },
      { name: "间谍过家家 阿尼亚 手机壳 iPhone款", price: 69, stock: 456, sales: 2345, source: "间谍过家家" },
      { name: "咒术回战 两面宿傩 鼠标垫 加大款", price: 89, stock: 345, sales: 1234, source: "咒术回战" },
      { name: "原神 派蒙 应急充电宝 10000mAh", price: 199, stock: 123, sales: 890, source: "原神" },
    ],
  };

  for (const [slug, products] of Object.entries(productData)) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) continue;
    for (const p of products) {
      await prisma.product.upsert({
        where: { id: `${slug}-${p.name}` },
        update: {},
        create: { id: `${slug}-${p.name}`, ...p, categoryId: cat.id, images: "[]" },
      });
    }
  }
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : "Seed error"); process.exit(1); })
  .finally(() => prisma.$disconnect());
