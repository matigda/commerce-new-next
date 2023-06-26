'use client';

import { VariantSelector } from './product/variant-selector';
import Prose from './prose';
import { AddToCart } from './cart/add-to-cart';
import ProductI, { productFactory } from '../Product/entities/Product';

export function Test({ productI }: { productI: ProductI }) {
  const product = productFactory(productI);

  return (
    <div className="p-6 lg:col-span-2">
      <VariantSelector product={product} options={productI.options} variants={productI.variants} />

      {productI.description ? (
        <Prose className="mb-6 text-sm leading-tight" html={productI.description} />
      ) : null}

      <AddToCart product={product} variants={productI.variants} availableForSale={true} />
    </div>
  );
}
