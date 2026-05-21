import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let _prisma: PrismaClient;

function getClient(): PrismaClient {
  if (_prisma) return _prisma;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  _prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;
  return _prisma;
}

export const prisma = new Proxy<PrismaClient>({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop, getClient());
  },
}) as PrismaClient;

export default prisma;
