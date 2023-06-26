import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import Grid from 'components/grid';
import Footer from 'components/layout/footer';
import ProductGridItems from 'components/layout/product-grid-items';
import { AddToCart } from 'components/cart/add-to-cart';
import { Gallery } from 'components/product/gallery';
import { VariantSelector } from 'components/product/variant-selector';
import Prose from 'components/prose';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants';
import { yellowJacket } from '../../../data';
import { Image, productFactory } from '../../../Product/entities/Product';
import fetchProduct from 'Shopify/queries/fetchProduct';
import { Test } from '../../../components/Test';

export const runtime = 'edge';

// export async function generateMetadata({
//                                            params
//                                        }: {
//     params: { handle: string };
// }): Promise<Metadata> {
//     const product = await getProduct(params.handle);
//
//     if (!product) return notFound();
//
//     const { url, width, height, altText: alt } = product.featuredImage || {};
//     const hide = !product.tags.includes(HIDDEN_PRODUCT_TAG);
//
//     return {
//         title: product.seo.title || product.title,
//         description: product.seo.description || product.description,
//         robots: {
//             index: hide,
//             follow: hide,
//             googleBot: {
//                 index: hide,
//                 follow: hide
//             }
//         },
//         openGraph: url
//             ? {
//                 images: [
//                     {
//                         url,
//                         width,
//                         height,
//                         alt
//                     }
//                 ]
//             }
//             : null
//     };
// }

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product = await fetchProduct(params.handle);

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image.srcset[0].url,
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      // : 'https://schema.org/OutOfStock',
      priceCurrency: product.price.currency,
      highPrice: product.price.actualPrice,
      lowPrice: product.price.actualPrice
    }
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="lg:grid lg:grid-cols-6">
        <div className="lg:col-span-4">
          <Gallery
            title={product.name}
            amount={product.price.actualPrice.toString()}
            currencyCode={product.price.currency}
            images={product.images.map((image: Image) => ({
              src: image.srcset[0].url,
              altText: image.alt
            }))}
          />
        </div>

        <Test productI={product} />
      </div>
      <Suspense>
        {/*<RelatedProducts id={product.id} />*/}
        <Suspense>
          <Footer />
        </Suspense>
      </Suspense>
    </div>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  // const relatedProducts = await getProductRecommendations(id);
  //
  // if (!relatedProducts.length) return null;

  return (
    <div className="px-4 py-8">
      <div className="mb-4 text-3xl font-bold">Related Products</div>
      <Grid className="grid-cols-2 lg:grid-cols-5">
        eloss
        {/*<ProductGridItems products={relatedProducts} />*/}
      </Grid>
    </div>
  );
}
