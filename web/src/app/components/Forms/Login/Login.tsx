'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@i18n/client';
import { fallbackLng } from '@i18n/utils';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '@store/index';
import { getAuthState, login } from '@store/slices/authSlice';
import { getLang } from '@store/slices/langSlice';
import { AUTH_TOKEN_COOKIE } from '@utils/constants';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ControlledTextField } from '../components';
import { LoginFormDefaultValues, LoginFormSchema, LoginFormType } from '../schemas';

export default function Login() {
  const dispatch = useAppDispatch();
  const lang = useAppSelector(getLang) || fallbackLng;
  const { user } = useAppSelector(getAuthState);
  const router = useRouter();
  const { t } = useTranslation(lang);

  useEffect(() => {
    if (user && Cookies.get(AUTH_TOKEN_COOKIE)) {
      router.push(`/${lang}`);
    }
  }, [user, lang, router]);

  const { control, handleSubmit } = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: LoginFormDefaultValues,
  });

  const submitHandler = ({ email, password }: LoginFormType) => {
    dispatch(login({ email, password }));
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="grid justify-center gap-4">
      <ControlledTextField
        t={t}
        control={control}
        label={t('common.email')}
        name="email"
        type="email"
        required
        className="!min-w-[300px]"
      />
      <ControlledTextField
        t={t}
        control={control}
        label={t('common.password')}
        name="password"
        type="password"
        required
        className="!min-w-[300px]"
      />
      <Button type="submit" variant="outlined">
        {t('button.login')}
      </Button>
    </form>
  );
}
