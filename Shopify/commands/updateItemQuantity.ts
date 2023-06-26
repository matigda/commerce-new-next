import Item from 'Cart/entities/Item';
import { gql, GraphQLClient } from 'graphql-request';
import CheckoutFragment from 'Shopify/graphQLFragments/checkout';

export default async function updateItemQuantity(
  item: Item,
  quantity: number,
  cartId: string,
  token?: string
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
    mutation ($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
      checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout {
          ...CheckoutFragment
        }
      }
    }
    ${CheckoutFragment}
  `;

  return await graphQLClient.request(query, {
    lineItems: [
      {
        id: item.cartItemId,
        variantId: item.product.getId(),
        quantity: item.quantity
      }
    ],
    checkoutId: cartId
  });
}
