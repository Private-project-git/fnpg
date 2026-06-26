// src/lib/repositories/quote.repository.ts
import prisma from '@/lib/prisma';

export class QuoteRepository {
  static async findAll() {
    return prisma.quote.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async saveAll(quotes: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.quote.deleteMany();
      const results = [];
      for (const q of quotes) {
        results.push(await tx.quote.create({ data: q }));
      }
      return results;
    });
  }
}
