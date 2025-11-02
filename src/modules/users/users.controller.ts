import {Body, Controller, Get, NotFoundException, Param, Patch, Request, UseGuards, UsePipes} from '@nestjs/common';
import type {FastifyRequest} from 'fastify';
import {JwtGuard, JwtPayload} from 'src/common/jwt.guard';
import {ZodValidationPipe} from 'src/common/zod.pipe';
import {PrismaService} from 'src/infra/prisma/prisma.service';
import {UpdateRoleSchema, type updateRoleDto} from "src/modules/users/users.dto";


@Controller('/users')
export class UsersController {
    constructor(private prisma: PrismaService) {
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        const user = await this.prisma.user.findUnique({
            where: {id},
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
        @Body() body: updateRoleDto,
    ) {
        return this.prisma.user.update({
            where: {id: req.user.uid},
            data: {role: body.role},
            select: {
                id: true,
                tgId: true,
                username: true,
                role: true,
                ratingAsExec: true,
                ratingAsCust: true,
            },
        });
    }
}
