import type { IPageProps } from '@utils/types';

import { fallbackLng } from '@i18n/utils';
import { redirect } from 'next/navigation';

export default async function Products({ params }: IPageProps) {
  const { lng = fallbackLng } = await params;

  redirect(`/${lng}`);
}
