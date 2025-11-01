import { Controller, Get, Patch, Param, Body, UseGuards, Request, UsePipes, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { JwtGuard, JwtPayload } from '../../common/jwt.guard.js';
import { ZodValidationPipe } from '../../common/zod.pipe.js';
import { z } from 'zod';
import type { FastifyRequest } from 'fastify';

const UpdateRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'EXECUTOR']),
});

@Controller('api/users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        tgId: true,
        username: true,
        role: true,
        ratingAsExec: true,
        ratingAsCust: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch('me/role')
  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(UpdateRoleSchema))
  async updateRole(
    @Request() req: FastifyRequest & { user: JwtPayload },
    @Body() body: z.infer<typeof UpdateRoleSchema>,
  ) {
    const user = await this.prisma.user.update({
      where: { id: req.user.uid },
      data: { role: body.role },
      select: {
        id: true,
        tgId: true,
        username: true,
        role: true,
        ratingAsExec: true,
        ratingAsCust: true,
      },
    });

    return user;
  }
}
