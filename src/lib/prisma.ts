import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

// Mock Prisma client to return rejected promises when the database is offline
const createPrismaMock = (reason: string) => {
  console.warn(`Prisma is operating in MOCK/OFFLINE mode. Reason: ${reason}`);
  const mockHandler = {
    get(target: any, prop: string): any {
      if (prop === '$queryRaw' || prop === '$executeRaw') {
        return () => Promise.reject(new Error(`Database offline: ${reason}`));
      }
      if (prop === 'then' || prop === 'catch') {
        return undefined;
      }
      return new Proxy({} as any, {
        get(subTarget, subProp) {
          if (subProp === 'then' || subProp === 'catch') {
            return undefined;
          }
          return () => Promise.reject(new Error(`Database offline: ${reason}`));
        }
      });
    }
  };
  return new Proxy({} as any, mockHandler) as unknown as PrismaClient;
};

const prismaClientSingleton = () => {
  let urlStr = process.env.DATABASE_URL;
  if (!urlStr) {
    return createPrismaMock('DATABASE_URL environment variable is not defined.');
  }

  // Clean double quotes from env loading
  if (urlStr.startsWith('"') && urlStr.endsWith('"')) {
    urlStr = urlStr.slice(1, -1);
  }

  try {
    const adapter = new PrismaMariaDb(urlStr);
    return new PrismaClient({ adapter });
  } catch (err: any) {
    console.error('Failed to initialize PrismaMariaDb adapter:', err);
    return createPrismaMock(err?.message || String(err));
  }
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

