import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  BOT_TOKEN: z.string().min(1),
  // S3 переменные отключены для минимальной конфигурации
  // Раскомментируйте при подключении UploadsModule
  // S3_ENDPOINT: z.string(),
  // S3_BUCKET: z.string().min(1),
  // S3_PUBLIC: z.string(),
  // S3_ACCESS_KEY: z.string().min(1),
  // S3_SECRET_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
