import type { IPageProps } from '@utils/types';

import { Loader } from '@components/UIElements';
import { fallbackLng } from '@i18n/utils';
import dynamic from 'next/dynamic';

const DynamicLoginPage = dynamic(() => import('../../views/Login'), {
  loading: () => <Loader />,
});

export default async function Login({ params }: IPageProps) {
  const { lng = fallbackLng } = await params;

  return <DynamicLoginPage lang={lng} />;
}
