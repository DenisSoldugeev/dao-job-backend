import {z} from "zod";

export const UpdateRoleSchema = z.object({
    role: z.enum(['CUSTOMER', 'EXECUTOR']),
});

export type updateRoleDto = z.infer<typeof UpdateRoleSchema>;
