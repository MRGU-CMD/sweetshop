import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let _prisma: PrismaClient;

function getClient(): PrismaClient {
  if (_prisma) return _prisma;
  _prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;
  return _prisma;
}

export const prisma = new Proxy<PrismaClient>({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop, getClient());
  },
}) as PrismaClient;

export default prisma;
