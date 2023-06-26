import { ComposedProduct, ProductMethods } from 'Product/entities/Product';

export default async function addProductToCart(
  product: ProductMethods,
  quantity: number,
  cartId: string,
  token?: string
) {
  const url = token ? '/carts/mine/items' : `/guest-carts/${cartId}/items`;
  const dataToSend = {
    cartItem: {
      quote_id: cartId,
      sku: product.getSku(),
      qty: quantity
    }
  };

  if (product instanceof ComposedProduct) {
    // @ts-ignore
    dataToSend['cartItem']['product_option'] = {
      extension_attributes: {
        bundle_options: product.getProducts().map((prod, index) => ({
          option_qty: prod.quantity,
          option_id: prod.product.id,
          option_selections: [index]
        }))
      }
    };
  }

  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dataToSend)
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || data.message || 'HTTP error');
      }
      return data;
    })
  );
}
