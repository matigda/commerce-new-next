import { gql, GraphQLClient } from 'graphql-request';
import Product, { Image, Option, PickedOption, ProductType } from 'Product/entities/Product';
import ProductI from 'Product/entities/Product';
import { ShopifyAddToCartOperation } from '../../lib/shopify/types';
import { addToCartMutation } from '../../lib/shopify/mutations/cart';
import { shopifyFetch } from '../../lib/shopify';

export default async function fetchProducts({}): Promise<Product[]> {
  // const graphQLClient = new GraphQLClient('https://biggest-ecommerce.myshopify.com/api/2020-10/graphql.json', {
  //     headers: {
  //         'X-Shopify-Storefront-Access-Token' : '7a415603317462ae8c7e4f98be2c5b5e'
  //     }
  // })

  const query = gql`
    query {
      products(first: 24) {
        edges {
          node {
            id
            title
            sku: handle
            description
            options {
              id
              name
              values
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  name: title
                  selectedOptions {
                    name
                    value
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  altText
                  originalSrc
                  transformedSrc
                }
              }
            }
          }
        }
      }
    }
  `;

  const result = await shopifyFetch<ShopifyAddToCartOperation>({
    query: query,
    cache: 'no-store'
  });

  const mapVariants = (product: ProductI, shopifyVariants: any) => {
    return shopifyVariants.map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      isDefault: false,
      urlIdentifier: product.urlIdentifier,
      type: ProductType.SIMPLE,
      description: product.description,
      image: product.image,
      images: product.images,
      price: {
        actualPrice: variant.priceV2.amount,
        currency: variant.priceV2.currencyCode
      },
      pickedOptions: variant.selectedOptions
    }));
  };

  return result.body.data.products.edges.map((product: any): Product => {
    const images = product.node.images.edges.map((image: any) => ({
      alt: image.node.altText,
      srcset: [
        { aspectRatio: 1, url: image.node.originalSrc, w: 500 },
        { aspectRatio: 1, url: image.node.transformedSrc, w: 500 }
      ]
    }));

    const mappedProduct: ProductI = {
      ...product.node,
      type: ProductType.COMPLEX,
      urlIdentifier: product.node.sku,
      name: product.node.title,
      price: {
        actualPrice: parseInt(product.node.variants.edges[0].node.priceV2.amount),
        currency: product.node.variants.edges[0].node.priceV2.currencyCode
      },
      image: images[0],
      images
    };

    return {
      ...mappedProduct,
      variants: mapVariants(
        mappedProduct,
        product.node.variants.edges.map((variant: any) => variant.node)
      )
    };
  });
}
