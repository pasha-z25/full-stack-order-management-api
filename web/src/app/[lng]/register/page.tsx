import type { IPageProps } from '@utils/types';

import { Loader } from '@components/UIElements';
import { fallbackLng } from '@i18n/utils';
import dynamic from 'next/dynamic';

const DynamicRegisterPage = dynamic(() => import('../../views/Register'), {
  loading: () => <Loader />,
});

export default async function Register({ params }: IPageProps) {
  const { lng = fallbackLng } = await params;

  return <DynamicRegisterPage lang={lng} />;
}
