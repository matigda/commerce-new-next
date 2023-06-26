import Item from 'Cart/entities/Item';

export default async function updateItemQuantity(item: Item, quantity: number) {
  const { product, ...rest } = item;
  const response = await fetch('/api/update-item-quantity', {
    method: 'PUT',
    body: JSON.stringify({
      item: { product: product.getProduct(), ...rest },
      quantity
    })
  });

  return await response.json();
}
