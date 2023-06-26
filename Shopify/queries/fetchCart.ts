import Product, { ProductType } from 'Product/entities/Product';
import { gql, GraphQLClient } from 'graphql-request';
import mapImage from 'Shopify/mappers/mapImage';
import CheckoutFragment from '../graphQLFragments/checkout';
import { shopifyFetch } from '../../lib/shopify';

export default async function fetchCart(cartId: string, token?: string) {
  // const graphQLClient = new GraphQLClient('https://biggest-ecommerce.myshopify.com/api/2020-10/graphql.json', {
  //     headers: {
  //         'X-Shopify-Storefront-Access-Token' : '7a415603317462ae8c7e4f98be2c5b5e'
  //     }
  // })

  const query = gql`
    query cart($cartId: ID!) {
      checkout: node(id: $cartId) {
        ...CheckoutFragment
      }
    }

    ${CheckoutFragment}
  `;

  return await shopifyFetch<any>({
    query: query,
    variables: {
      cartId
    }
  });

  // return await graphQLClient.request(query);
  //
  // const images = result.node.images.edges.map(mapImage);
}
