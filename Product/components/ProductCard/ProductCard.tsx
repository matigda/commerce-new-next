import type { FC } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import usePrice from '@bigcommerce/storefront-data-hooks/use-price';
import { EnhancedImage } from '@Core/components';
import s from './ProductCard.module.css';
import WishlistButton from '@Wishlist/components/WishlistButton';
import { ProductMethods } from 'Product/entities/Product';

interface Props {
  className?: string;
  product: ProductMethods;
  variant?: 'slim' | 'simple';
  imgWidth: number | string;
  imgHeight: number | string;
  priority?: boolean;
}

const ProductCard: FC<Props> = ({
  className,
  product: p,
  variant,
  imgWidth,
  imgHeight,
  priority
}) => {
  const { price } = usePrice({
    amount: p.getPrice().actualPrice,
    baseAmount: p.getPrice().actualPrice,
    currencyCode: p.getPrice().currency
  });

  return (
    <Link href={`/product/${p.getUrlIdentifier()}`}>
      <a className={cn(s.root, { [s.simple]: variant === 'simple' }, className)}>
        {variant === 'slim' ? (
          <div className="relative box-border overflow-hidden border-red-100">
            <div className="absolute inset-0 z-20 mr-8 flex items-center justify-end">
              <span className="inline-block break-words bg-black p-3 text-xl font-bold text-white">
                {p.getName()}
              </span>
            </div>
            <EnhancedImage
              image={p.getImages()[0]}
              src={
                'http://local-magento.com/media/catalog/product/cache/cff1831e076281abdbf1cd2ec3b023d7/m/b/mb02-gray-0.jpg'
              }
              alt={'Product Image'}
              width={imgWidth}
              height={imgHeight}
              priority={priority}
              quality="85"
            />
          </div>
        ) : (
          <>
            <div className={s.squareBg} />
            <div className="absolute z-20 box-border flex w-full flex-row justify-between">
              <div className="absolute left-0 top-0 max-w-full pr-16">
                <h3 className={s.productTitle}>
                  <span>{p.getName()}</span>
                </h3>
                <span className={s.productPrice}>{price}</span>
              </div>
              {/*<WishlistButton*/}
              {/*  className={s.wishlistButton}*/}
              {/*  productId={p.entityId}*/}
              {/*  variant={p.variants.edges?.[0]!}*/}
              {/*/>*/}
            </div>
            <div className={s.imageContainer}>
              <EnhancedImage
                image={p.getImages()[0]}
                alt={p.getName()}
                className={cn('w-full object-cover', s['product-image'])}
                src={
                  '/media/catalog/product/cache/cff1831e076281abdbf1cd2ec3b023d7/m/b/mb02-gray-0.jpg'
                }
                width={imgWidth}
                height={imgHeight}
                priority={priority}
                quality="85"
              />
            </div>
          </>
        )}
      </a>
    </Link>
  );
};

export default ProductCard;
