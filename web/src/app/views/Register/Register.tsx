'use client';

import type { IViewProps } from '@utils/types';

import { Register as RegisterForm } from '@components/Forms';
import Loader from '@components/UIElements/Loader';
import { useTranslation } from '@i18n/client';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@store/index';
import { getAuthState } from '@store/slices/authSlice';
import Link from 'next/link';
import { IoIosPersonAdd } from 'react-icons/io';

export default function Register({ lang }: IViewProps) {
  const { t } = useTranslation(lang);
  const { loading, error } = useAppSelector(getAuthState);

  return (
    <section className="register-section py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center gap-4">
          <IoIosPersonAdd size={30} color="green" />
          <Typography variant="h4" component="h1">
            {t('common.register')}
          </Typography>
        </div>
        <Card sx={{ py: 4 }}>
          <CardContent>
            {!!error && (
              <Alert severity="error" className="mx-auto mb-8 max-w-max min-w-[300px]">
                {error}
              </Alert>
            )}
            <Typography variant="h5" component="h2" sx={{ mb: 4, textAlign: 'center' }}>
              {t('sections.registerPageHeader')}
            </Typography>
            <RegisterForm />
            <Typography sx={{ mt: 4, textAlign: 'center' }}>
              {t('sections.registerPageFooter')}{' '}
              <Link href={`/${lang}/login`} className="underline">
                {t('button.login')}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </div>
      {!!loading && <Loader />}
    </section>
  );
}
