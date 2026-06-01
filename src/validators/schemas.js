import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Enter a name.').max(120, 'Name is too long.'),
    role: z.enum(['admin', 'owner', 'user'], {
      errorMap: () => ({ message: 'Choose a valid role.' }),
    }),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    role: z.enum(['admin', 'owner', 'user'], {
      errorMap: () => ({ message: 'Choose a valid role.' }),
    }),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const createBookingSchema = z.object({
  body: z.object({
    startTime: z
      .string()
      .datetime({ message: 'Enter a valid start date and time.' }),
    endTime: z.string().datetime({ message: 'Enter a valid end date and time.' }),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
