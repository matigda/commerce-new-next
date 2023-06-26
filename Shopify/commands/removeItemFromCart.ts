import { gql, GraphQLClient } from 'graphql-request';
import CheckoutFragment from 'Shopify/graphQLFragments/checkout';
import Item from 'Cart/entities/Item';

export default async function removeItemFromCart(item: Item, cartId: string) {
  const graphQLClient = new GraphQLClient(
    'https://biggest-ecommerce.myshopify.com/api/2020-10/graphql.json',
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': '7a415603317462ae8c7e4f98be2c5b5e'
      }
    }
  );

  const query = gql`
    mutation ($checkoutId: ID!, $lineItemIds: [ID!]!) {
      checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
        checkout {
          ...CheckoutFragment
        }
      }
    }
    ${CheckoutFragment}
  `;

  return await graphQLClient.request(query, {
    lineItemIds: [item.cartItemId],
    checkoutId: cartId
  });
}
