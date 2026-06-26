// src/lib/repositories/gallery.repository.ts
import prisma from '@/lib/prisma';

export class GalleryRepository {
  static async findAll() {
    return prisma.galleryItem.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async saveAll(items: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.galleryItem.deleteMany();
      const results = [];
      for (const item of items) {
        results.push(await tx.galleryItem.create({ data: item }));
      }
      return results;
    });
  }
}
