import {Controller, Get, Param, NotFoundException} from '@nestjs/common';
import {PrismaService} from 'src/infra/prisma/prisma.service';

@Controller('/categories')
export class CategoriesController {
    constructor(private prisma: PrismaService) {
    }

    @Get()
    async getCategories() {
        return this.prisma.category.findMany({
            where: {active: true},
            orderBy: {sort: 'asc'},
        });
    }

    @Get(':slug')
    async getCategory(@Param('slug') slug: string) {
        const category = await this.prisma.category.findUnique({
            where: {slug, active: true},
            include: {
                specializations: {
                    where: {active: true},
                    orderBy: {sort: 'asc'},
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
