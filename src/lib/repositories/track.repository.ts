// src/lib/repositories/track.repository.ts
import prisma from '@/lib/prisma';

export class TrackRepository {
  static async findAll() {
    return prisma.track.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async findById(id: string) {
    return prisma.track.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return prisma.track.create({
      data,
    });
  }

  static async update(id: string, data: any) {
    return prisma.track.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.track.delete({
      where: { id },
    });
  }
}
