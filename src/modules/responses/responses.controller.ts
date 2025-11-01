import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  UsePipes,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { JwtGuard, JwtPayload } from '../../common/jwt.guard.js';
import { ZodValidationPipe } from '../../common/zod.pipe.js';
import { z } from 'zod';
import type { FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';

const CreateResponseSchema = z.object({
  taskId: z.string().min(1),
  text: z.string().trim().min(10),
  price: z.number().int().nonnegative().optional(),
});

const GetResponsesSchema = z.object({
  taskId: z.string().optional(),
  skip: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional(),
  take: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

@Controller('api/responses')
export class ResponsesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(CreateResponseSchema))
  async create(
    @Request() req: FastifyRequest & { user: JwtPayload },
    @Body() body: z.infer<typeof CreateResponseSchema>,
  ) {
    // Check task exists and is active
    const task = await this.prisma.task.findUnique({
      where: { id: body.taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    if (task.status !== 'ACTIVE') {
      throw new BadRequestException('Task is not active');
    }

    // Check not responding to own task
    if (task.authorId === req.user.uid) {
      throw new BadRequestException('Cannot respond to own task');
    }

    // Create response (unique constraint will be caught)
    try {
      const response = await this.prisma.response.create({
        data: {
          taskId: body.taskId,
          userId: req.user.uid,
          text: body.text,
          price: body.price,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              ratingAsExec: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Already responded to this task');
        }
      }
      throw error;
    }
  }

  @Get()
  async getResponses(@Query() query: z.infer<typeof GetResponsesSchema>) {
    const validated = GetResponsesSchema.parse(query);
    const { taskId, skip = 0, take = 20 } = validated;

    const where: Prisma.ResponseWhereInput = {};
    if (taskId) {
      where.taskId = taskId;
    }

    const responses = await this.prisma.response.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            ratingAsExec: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return responses;
  }
}
