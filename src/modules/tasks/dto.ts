import { z } from 'zod';

export const CreateTaskSchema = z
  .object({
    type: z.enum(['SERVICE_REQUEST', 'SERVICE_OFFER']),
    categoryId: z.string().min(1),
    specializationIds: z.array(z.string().min(1)).min(1).max(5),
    title: z.string().trim().min(5).max(140),
    description: z.string().trim().min(20),
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    currency: z.string().default('USDT'),
    attachments: z
      .array(
        z.object({
          url: z.string().url(),
          mime: z.string().min(1),
        }),
      )
      .max(3)
      .optional(),
  })
  .refine((d) => !(d.budgetMin && d.budgetMax) || d.budgetMin! <= d.budgetMax!, {
    path: ['budgetMax'],
    message: 'budgetMin must be <= budgetMax',
  });

export const UpdateStatusSchema = z.object({
  status: z.enum(['PAUSED', 'ACTIVE', 'DONE', 'CANCELED']),
});

export const GetTasksSchema = z.object({
  categoryId: z.string().optional(),
  specializationId: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DONE', 'CANCELED']).optional(),
  skip: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional(),
  take: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});
