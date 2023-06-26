'use client';

import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import LoadingDots from 'components/loading-dots';
import { ProductVariant } from 'lib/shopify/types';
import ProductI, { ProductMethods } from '../../Product/entities/Product';
import { useCartCommand } from '../../Checkout/providers/CheckoutCommandQueryProvider';

export function AddToCart({
  variants,
  availableForSale,
  product
}: {
  variants: ProductI[];
  availableForSale: boolean;
  product: ProductMethods;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { addProduct = (product: ProductMethods) => {} } = useCartCommand();

  useEffect(() => {
    const variant = variants.find((variant: ProductI) =>
      variant.pickedOptions?.every(
        (option) => option.value === searchParams.get(option.name.toLowerCase())
      )
    );

    if (variant) {
      setSelectedVariantId(variant.id);
    }
  }, [searchParams, variants, setSelectedVariantId]);

  return (
    <button
      aria-label="Add item to cart"
      disabled={isPending}
      onClick={() => {
        if (!availableForSale) return;

        addProduct(product, 1);
        // startTransition(async () => {
        //     await addProduct(product);
        //   // const error = await addItem(selectedVariantId);
        //   //
        //   // if (error) {
        //   //   alert(error);
        //   //   return;
        //   // }
        //
        //   router.refresh();
        // });
      }}
      className={clsx(
        'flex w-full items-center justify-center bg-black p-4 text-sm uppercase tracking-wide text-white opacity-90 hover:opacity-100 dark:bg-white dark:text-black',
        {
          'cursor-not-allowed opacity-60': !availableForSale,
          'cursor-not-allowed': isPending
        }
      )}
    >
      <span>{availableForSale ? 'Add To Cart' : 'Out Of Stock'}</span>
      {isPending ? <LoadingDots className="bg-white dark:bg-black" /> : null}
    </button>
  );
}
