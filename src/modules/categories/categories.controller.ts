import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

@Controller('api/categories')
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      where: { active: true },
      orderBy: { sort: 'asc' },
      include: {
        specializations: {
          where: { active: true },
          orderBy: { sort: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            sort: true,
          },
        },
      },
    });

    return categories;
  }

  @Get(':slug')
  async getCategory(@Param('slug') slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, active: true },
      include: {
        specializations: {
          where: { active: true },
          orderBy: { sort: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            sort: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
