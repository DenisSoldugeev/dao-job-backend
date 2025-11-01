import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import {AppModule} from './app.module';
// import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

// import multipart from '@fastify/multipart';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({logger: true}),
    );

    // Helmet - отключен для упрощения минимальной конфигурации
    // await app.register(helmet, {
    //   contentSecurityPolicy: {
    //     directives: {
    //       defaultSrc: [`'self'`],
    //       styleSrc: [`'self'`, `'unsafe-inline'`],
    //       imgSrc: [`'self'`, 'data:', 'https:'],
    //       scriptSrc: [`'self'`],
    //     },
    //   },
    // });

    await app.register(cors, {
        origin: true,
        credentials: true,
    });

    // Multipart - отключен (не нужен для базовой авторизации)
    // await app.register(multipart, {
    //   limits: {
    //     fileSize: 5 * 1024 * 1024, // 5 MB
    //     files: 3,
    //   },
    // });
    app.setGlobalPrefix('/api/v1');
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
