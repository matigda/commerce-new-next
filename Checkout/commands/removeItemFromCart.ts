import Item from 'Cart/entities/Item';

export default async function removeItemFromCart(item: Item) {
  const { product, ...rest } = item;
  const response = await fetch('/api/remove-item-from-cart', {
    method: 'DELETE',
    body: JSON.stringify({
      item: { product: product.getProduct(), ...rest }
    })
  });

  return await response.json();
}
