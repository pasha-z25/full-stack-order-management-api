'use client';

import { useTranslation } from '@/i18n/client';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  getAllProducts,
  getProduct,
  getProducts,
  getProductsStatus,
  getSelectedProduct,
} from '@/store/slices/productsSlice';
import type { IViewProps, Product } from '@/utils/types';
import { Error, Loader } from '@components/UIElements';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { IoIosArrowForward } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

export default function OneProduct({ lang, id: productId }: IViewProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(getAllProducts);
  const selectedProduct = useAppSelector(getSelectedProduct);
  const { loading, error } = useAppSelector(getProductsStatus);

  const { t } = useTranslation(lang);

  useEffect(() => {
    if (!loading && !products?.length) {
      dispatch(getProducts());
    }

    if (productId) {
      dispatch(getProduct(productId));
    }
  }, [products?.length, dispatch, productId]);

  if (loading) return <Loader />;

  if (error) return <Error message={error} />;

  if (!selectedProduct) return null;

  const renderProductCard = (product: Product) => {
    return (
      <>
        <CardContent className="flex-auto">
          <div className="product-card flex items-center gap-4">
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
          </div>
        </CardContent>
        {product.id === selectedProduct.id && (
          <div className="flex min-w-16 items-center justify-center bg-slate-200 hover:bg-slate-300">
            <IoIosArrowForward size={30} />
          </div>
        )}
      </>
    );
  };

  const renderSelectedProduct = (product: Product) => {
    return (
      <div className="selected-product">
        <Image
          src={product.image}
          alt={product.title}
          width="1500"
          height="1500"
          loading="lazy"
          unoptimized={true}
          className="mb-4 rounded-sm"
        />
        <div className="flex items-center justify-between">
          <Typography variant="h6" component="h1">
            {product.title}
          </Typography>
        </div>
      </div>
    );
  };

  return (
    <section className="products-section py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center gap-4">
          <Typography variant="h3" component="h2">
            <Link href={`/${lang}/products`}>{t('common.products')}</Link> / {selectedProduct.id}
          </Typography>
        </div>
        <div className="wrapper flex items-start gap-6">
          <List className="grid gap-4 !py-0">
            {!!products?.length &&
              products.map((product: Product) => (
                <ListItem key={product.id} className="!p-0">
                  <Link href={`/${lang}/products/${product.id}`} className="min-w-[412px]">
                    <Card className="flex">{renderProductCard(product)}</Card>
                  </Link>
                </ListItem>
              ))}
          </List>
          {!!selectedProduct && (
            <div className="relative flex-auto">
              <Link
                href={`/${lang}/products`}
                className="absolute -top-3 -right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-md"
              >
                <IoCloseOutline size={20} />
              </Link>
              <Card>
                <CardContent>{renderSelectedProduct(selectedProduct)}</CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
