import { gql, GraphQLClient } from 'graphql-request';
import { ProductMethods, ProductWithVariants } from 'Product/entities/Product';
import CheckoutFragment from '../graphQLFragments/checkout';

export default async function createCart(product: ProductMethods, quantity: number) {
  const graphQLClient = new GraphQLClient(
    'https://biggest-ecommerce.myshopify.com/api/2020-10/graphql.json',
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': '7a415603317462ae8c7e4f98be2c5b5e'
      }
    }
  );

  const query = gql`
    mutation ($checkoutInput: CheckoutCreateInput!) {
      checkoutCreate(input: $checkoutInput) {
        checkout {
          ...CheckoutFragment
        }
      }
    }
    ${CheckoutFragment}
  `;

  return await graphQLClient.request(query, {
    checkoutInput: {
      lineItems: [
        { variantId: (product as ProductWithVariants).getPickedVariant()!.getId(), quantity }
      ]
    }
  });
}
