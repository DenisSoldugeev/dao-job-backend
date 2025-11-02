import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { validateTelegramInitData } from './telegram.util.js';
import { ZodValidationPipe } from 'src/common/zod.pipe';
import { z } from 'zod';

const TelegramAuthSchema = z.object({
  initData: z.string().min(1),
});

@Controller('/auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('telegram')
  @UsePipes(new ZodValidationPipe(TelegramAuthSchema))
  async telegram(@Body() body: z.infer<typeof TelegramAuthSchema>) {
    const botToken = this.configService.get<string>('BOT_TOKEN')!;
    const tgUser = validateTelegramInitData(body.initData, botToken);

    const user = await this.prisma.user.upsert({
      where: { tgId: String(tgUser.id) },
      update: {
        username: tgUser.username,
      },
      create: {
        tgId: String(tgUser.id),
        username: tgUser.username,
      },
    });

    // Generate JWT
   const token =  await this.jwtService.signAsync(
      {
        uid: user.id,
        tgId: user.tgId,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '2h',
      },
    );

    return { token };
  }
}
