import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UsePipes,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { JwtGuard, JwtPayload } from '../../common/jwt.guard.js';
import { ZodValidationPipe } from '../../common/zod.pipe.js';
import { CreateTaskSchema, UpdateStatusSchema, GetTasksSchema } from './dto.js';
import { z } from 'zod';
import type { FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';

@Controller('api/tasks')
export class TasksController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(CreateTaskSchema))
  async create(
    @Request() req: FastifyRequest & { user: JwtPayload },
    @Body() body: z.infer<typeof CreateTaskSchema>,
  ) {
    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: body.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Validate specializations exist and belong to category
    const specializations = await this.prisma.specialization.findMany({
      where: {
        id: { in: body.specializationIds },
      },
    });

    if (specializations.length !== body.specializationIds.length) {
      throw new BadRequestException('Some specializations not found');
    }

    const wrongCategory = specializations.find((s) => s.categoryId !== body.categoryId);
    if (wrongCategory) {
      throw new BadRequestException(
        `Specialization ${wrongCategory.slug} does not belong to category`,
      );
    }

    // Create task with attachments and specializations
    const task = await this.prisma.task.create({
      data: {
        authorId: req.user.uid,
        categoryId: body.categoryId,
        type: body.type,
        title: body.title,
        description: body.description,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        currency: body.currency,
        attachments: body.attachments
          ? {
              create: body.attachments.map((a) => ({
                url: a.url,
                mime: a.mime,
              })),
            }
          : undefined,
        specs: {
          create: body.specializationIds.map((sid) => ({
            specializationId: sid,
          })),
        },
      },
      include: {
        category: true,
        specs: {
          include: {
            specialization: true,
          },
        },
        attachments: true,
      },
    });

    return task;
  }

  @Get()
  async getTasks(@Query() query: z.infer<typeof GetTasksSchema>) {
    const validated = GetTasksSchema.parse(query);
    const { categoryId, specializationId, status, skip = 0, take = 20 } = validated;

    const where: Prisma.TaskWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (specializationId) {
      where.specs = {
        some: {
          specializationId,
        },
      };
    }

    if (status) {
      where.status = status;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        category: true,
        specs: {
          include: {
            specialization: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            ratingAsExec: true,
            ratingAsCust: true,
          },
        },
        attachments: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return tasks;
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(UpdateStatusSchema))
  async updateStatus(
    @Request() req: FastifyRequest & { user: JwtPayload },
    @Param('id') id: string,
    @Body() body: z.infer<typeof UpdateStatusSchema>,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.authorId !== req.user.uid) {
      throw new ForbiddenException('Only author can update task status');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: body.status },
      include: {
        category: true,
        specs: {
          include: {
            specialization: true,
          },
        },
        attachments: true,
      },
    });

    return updated;
  }
}
