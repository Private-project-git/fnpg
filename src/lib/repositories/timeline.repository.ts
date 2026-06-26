// src/lib/repositories/timeline.repository.ts
import prisma from '@/lib/prisma';

export class TimelineRepository {
  static async findAll() {
    return prisma.timelineEvent.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async saveAll(events: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.timelineEvent.deleteMany();
      const results = [];
      for (const ev of events) {
        results.push(await tx.timelineEvent.create({ data: ev }));
      }
      return results;
    });
  }
}
