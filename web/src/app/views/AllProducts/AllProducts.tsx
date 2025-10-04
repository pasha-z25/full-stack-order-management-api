'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { getAllProducts, getProducts, getProductsStatus } from '@/store/slices/productsSlice';
import { Error, Loader } from '@components/UIElements';
import { useTranslation } from '@i18n/client';
import type { IViewProps, Product } from '@utils/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

export default function AllProducts({ lang }: IViewProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(getProductsStatus);
  const products = useAppSelector(getAllProducts);

  const { t } = useTranslation(lang);

  useEffect(() => {
    if (!loading && !products?.length) {
      dispatch(getProducts());
    }
  }, [products?.length, dispatch]);

  if (loading) return <Loader />;

  if (error) return <Error message={error} />;

  const renderProductCard = (product: Product) => {
    return (
      <div className="product-card flex items-center justify-between gap-4">
        <span className="list-dot" />
        <Image
          src={product.image}
          alt={product.title}
          width="70"
          height="70"
          loading="lazy"
          unoptimized={true}
        />
        <Typography variant="h6" component="h2" className="crop-text">
          <Link className="underline" href={`/${lang}/products/${product.id}`}>
            {product.title}
          </Link>
        </Typography>
        <Typography className="min-w-[150px]">{product.price}</Typography>
      </div>
    );
  };

  return (
    <section className="products-section py-12">
      <div className="container mx-auto px-4">
        <div className="wrapper">
          <div className="mb-10 flex items-center gap-4">
            <Typography variant="h3" component="h1">
              {t('common.products')}
            </Typography>
          </div>
          <List className="grid gap-4">
            {!!products?.length &&
              products.map((product: Product) => (
                <ListItem key={product.id} className="!p-0">
                  <Card className="flex-auto">
                    <CardContent>{renderProductCard(product)}</CardContent>
                  </Card>
                </ListItem>
              ))}
          </List>
        </div>
      </div>
    </section>
  );
}
