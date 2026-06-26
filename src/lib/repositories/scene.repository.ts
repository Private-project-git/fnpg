// src/lib/repositories/scene.repository.ts
import prisma from '@/lib/prisma';

export class SceneRepository {
  static async findAll() {
    return prisma.scene.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async findById(id: string) {
    return prisma.scene.findUnique({
      where: { id },
    });
  }

  static async saveAll(scenes: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.scene.deleteMany();
      const results = [];
      for (const scene of scenes) {
        results.push(await tx.scene.create({ data: scene }));
      }
      return results;
    });
  }
}
