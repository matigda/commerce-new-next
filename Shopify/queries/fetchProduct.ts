import Product, { ProductType } from 'Product/entities/Product';
import { gql, GraphQLClient } from 'graphql-request';
import mapImage from 'Shopify/mappers/mapImage';
import { shopifyFetch } from '../../lib/shopify';

export default async function fetchProduct(handle: string): Promise<Product> {
  const query = gql`
    query productByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        sku: handle
        description
        name: title
        options {
          id
          name
          values
        }
        variants(first: 10) {
          edges {
            node {
              id
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
        images(first: 10) {
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
  `;

  const resp = await shopifyFetch<any>({
    query: query,
    variables: {
      handle
    }
  });

  const result = resp.body.data;
  const images = result.productByHandle.images.edges.map(mapImage);

  return {
    ...result.productByHandle,
    options: result.productByHandle.options.map((option: any) => ({
      ...option,
      name: option.name.toLowerCase()
    })),
    type: ProductType.COMPLEX,
    price: {
      actualPrice: parseFloat(result.productByHandle.variants.edges[0].node.priceV2.amount),
      currency: result.productByHandle.variants.edges[0].node.priceV2.currencyCode
    },
    image: images[0],
    images,
    variants: result.productByHandle.variants.edges.map((node: any) => ({
      id: node.node.id,
      images,
      type: ProductType.SIMPLE,
      options: result.productByHandle.options.map((option: any) => ({
        ...option,
        name: option.name.toLowerCase()
      })),
      pickedOptions: node.node.selectedOptions.map((option: any) => ({
        ...option,
        name: option.name.toLowerCase()
      })),
      image: images[0],
      sku: result.productByHandle.sku,
      price: {
        actualPrice: parseFloat(node.node.priceV2.amount),
        currency: node.node.priceV2.currencyCode
      }
    }))
    // additionalData: {
    //     handle
    // }
  };
}
