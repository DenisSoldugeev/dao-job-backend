import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { JwtGuard, JwtPayload } from '../../common/jwt.guard.js';
import { ZodValidationPipe } from '../../common/zod.pipe.js';
import { z } from 'zod';
import type { FastifyRequest } from 'fastify';

const CreateReviewSchema = z.object({
  toUserId: z.string().min(1),
  taskId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).optional(),
});

@Controller('api/reviews')
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  async create(
    @Request() req: FastifyRequest & { user: JwtPayload },
    @Body() body: z.infer<typeof CreateReviewSchema>,
  ) {
    const fromUserId = req.user.uid;

    // Check not reviewing self
    if (fromUserId === body.toUserId) {
      throw new BadRequestException('Cannot review yourself');
    }

    // Check task exists and is done
    const task = await this.prisma.task.findUnique({
      where: { id: body.taskId },
      include: {
        responses: {
          where: {
            OR: [{ userId: fromUserId }, { userId: body.toUserId }],
          },
        },
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    if (task.status !== 'DONE') {
      throw new BadRequestException('Can only review completed tasks');
    }

    // Check that reviewer is task author or has response in this task
    const isAuthor = task.authorId === fromUserId;
    const hasResponse = task.responses.some((r) => r.userId === fromUserId);

    if (!isAuthor && !hasResponse) {
      throw new BadRequestException('Can only review tasks you participated in');
    }

    // Check that reviewee is task author or has response in this task
    const revieweeIsAuthor = task.authorId === body.toUserId;
    const revieweeHasResponse = task.responses.some((r) => r.userId === body.toUserId);

    if (!revieweeIsAuthor && !revieweeHasResponse) {
      throw new BadRequestException('Can only review task participants');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        fromUserId,
        toUserId: body.toUserId,
        taskId: body.taskId,
        rating: body.rating,
        comment: body.comment,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
          },
        },
        toUser: {
          select: {
            id: true,
            username: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update ratings (simplified: just average)
    const reviews = await this.prisma.review.findMany({
      where: { toUserId: body.toUserId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Determine if reviewee was executor or customer in this task
    const wasExecutor = task.authorId !== body.toUserId;

    await this.prisma.user.update({
      where: { id: body.toUserId },
      data: wasExecutor ? { ratingAsExec: avgRating } : { ratingAsCust: avgRating },
    });

    return review;
  }
}
