import { gql, GraphQLClient } from 'graphql-request';
import { ProductMethods, ProductWithVariants } from 'Product/entities/Product';
import CheckoutFragment from '../graphQLFragments/checkout';

export default async function addProductToCart(
  product: ProductMethods,
  quantity: number,
  cartId: string
) {
  const graphQLClient = new GraphQLClient(
    'https://biggest-ecommerce.myshopify.com/api/2020-10/graphql.json',
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': '7a415603317462ae8c7e4f98be2c5b5e'
      }
    }
  );

  const query = gql`
    mutation ($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
      checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout {
          ...CheckoutFragment
        }
      }
    }
    ${CheckoutFragment}
  `;

  return await graphQLClient.request(query, {
    lineItems: [
      { variantId: (product as ProductWithVariants).getPickedVariant()!.getId(), quantity }
    ],
    checkoutId: cartId
  });
}
