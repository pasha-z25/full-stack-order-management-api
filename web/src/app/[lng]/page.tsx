import { Loader } from '@components/UIElements';
import { fallbackLng } from '@i18n/utils';
import type { IPageProps } from '@utils/types';
import dynamic from 'next/dynamic';

const DynamicProductsPage = dynamic(() => import('../views/AllProducts'), {
  loading: () => <Loader />,
});

export default async function Products({ params }: IPageProps) {
  const { lng = fallbackLng } = await params;

  return <DynamicProductsPage lang={lng} />;
}
