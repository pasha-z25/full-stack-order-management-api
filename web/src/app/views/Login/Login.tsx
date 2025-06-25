'use client';

import type { IViewProps } from '@utils/types';

import { Login as LoginForm } from '@components/Forms';
import Loader from '@components/UIElements/Loader';
import { useTranslation } from '@i18n/client';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@store/index';
import { getAuthState } from '@store/slices/authSlice';
import Link from 'next/link';
import { IoIosLogIn } from 'react-icons/io';

export default function Login({ lang }: IViewProps) {
  const { t } = useTranslation(lang);
  const { loading, error } = useAppSelector(getAuthState);

  return (
    <section className="login-section py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center gap-4">
          <IoIosLogIn size={30} color="green" />
          <Typography variant="h4" component="h1">
            {t('common.login')}
          </Typography>
        </div>
        <Card sx={{ py: 4 }}>
          <CardContent>
            {!!error && (
              <Alert severity="error" className="mx-auto mb-8 min-w-[300px] max-w-max">
                {error}
              </Alert>
            )}
            <Typography variant="h5" component="h2" sx={{ mb: 4, textAlign: 'center' }}>
              {t('sections.loginPageHeader')}
            </Typography>
            <LoginForm />
            <Typography sx={{ mt: 4, textAlign: 'center' }}>
              {t('sections.loginPageFooter')}{' '}
              <Link href={`/${lang}/register`} className="underline">
                {t('button.register')}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </div>
      {!!loading && <Loader />}
    </section>
  );
}
