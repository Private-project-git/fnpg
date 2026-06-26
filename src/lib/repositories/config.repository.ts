// src/lib/repositories/config.repository.ts
import prisma from '@/lib/prisma';

export class ConfigRepository {
  static async find() {
    return prisma.appConfig.findFirst();
  }

  static async update(id: string, data: any) {
    return prisma.appConfig.update({
      where: { id },
      data,
    });
  }

  static async create(data: any) {
    return prisma.appConfig.create({
      data,
    });
  }
}
