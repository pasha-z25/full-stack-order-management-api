import isMobilePhone from 'validator/es/lib/isMobilePhone';
import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'zodErrors.fieldHasToBeFilled' })
    .email({ message: 'zodErrors.notValidEmail' }),
  password: z.string().min(6, { message: 'zodErrors.tooShortPassword' }),
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;

export const LoginFormDefaultValues = {
  email: '',
  password: '',
};

export const RegisterFormSchema = z
  .object({
    name: z.string().min(2, { message: 'zodErrors.tooShortName' }),
    email: z
      .string()
      .min(1, { message: 'zodErrors.fieldHasToBeFilled' })
      .email({ message: 'zodErrors.notValidEmail' }),
    phone: z
      .string()
      .refine((phone) => isMobilePhone(phone), {
        message: 'zodErrors.notValidPhone',
      })
      .optional(),
    password: z.string().min(6, { message: 'zodErrors.tooShortPassword' }),
    confirmPassword: z.string().min(6, { message: 'zodErrors.tooShortPassword' }),

    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'zodErrors.passwordsDontMatch',
    path: ['confirmPassword'],
  });

export type RegisterFormType = z.infer<typeof RegisterFormSchema>;

export const RegisterFormDefaultValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
};
