import Item from 'Cart/entities/Item';

export default async function removeItemFromCart(item: Item, cartId: string, token?: string) {
  const url = token
    ? `/carts/mine/items/${item.cartItemId}`
    : `/guest-carts/${cartId}/items/${item.cartItemId}`;

  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || 'HTTP error');
      }
      return data;
    })
  );
}
