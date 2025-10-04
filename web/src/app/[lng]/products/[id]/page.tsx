import { fallbackLng } from '@/i18n/utils';
import type { IPageProps } from '@/utils/types';
import { Loader } from '@components/UIElements';
import dynamic from 'next/dynamic';

const DynamicProductPage = dynamic(() => import('../../../views/OneProduct'), {
  loading: () => <Loader />,
});

export default async function Product({ params }: IPageProps) {
  const { id, lng = fallbackLng } = await params;

  if (!id) return null;

  return <DynamicProductPage id={id} lang={lng} />;
}
