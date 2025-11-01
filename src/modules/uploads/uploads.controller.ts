import { Controller, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { JwtGuard } from '../../common/jwt.guard.js';
import { ZodValidationPipe } from '../../common/zod.pipe.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const PresignSchema = z.object({
  mime: z.string().min(1),
});

@Controller('api/uploads')
export class UploadsController {
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET')!;
    this.publicUrl = this.configService.get<string>('S3_PUBLIC')!;

    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY')!,
      },
      forcePathStyle: true,
    });
  }

  @Post('presign')
  @UseGuards(JwtGuard)
  @UsePipes(new ZodValidationPipe(PresignSchema))
  async presign(@Body() body: z.infer<typeof PresignSchema>) {
    const key = `${randomUUID()}.${body.mime.split('/')[1] || 'bin'}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: body.mime,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${this.publicUrl}/${key}`;

    return {
      url,
      publicUrl,
      key,
    };
  }
}
