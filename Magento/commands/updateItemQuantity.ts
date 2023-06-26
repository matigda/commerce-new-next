import Item from 'Cart/entities/Item';

export default async function updateItemQuantity(
  item: Item,
  quantity: number,
  cartId: string,
  token?: string
) {
  const url = token
    ? `/carts/mine/items/${item.cartItemId}`
    : `/guest-carts/${cartId}/items/${item.cartItemId}`;
  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      cartItem: {
        quote_id: cartId,
        sku: item.product.getSku(),
        qty: quantity
      }
    })
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || 'HTTP error');
      }
      return data;
    })
  );
}
