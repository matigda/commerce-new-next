import { BillingContextSchema } from 'Checkout/stateMachines/CheckoutStateMachine';
import Item from 'Cart/entities/Item';

export default async function mergeCarts(items: Item[]) {
  const response = await fetch('/api/merge-carts', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((item) => {
        const { product, ...rest } = item;

        return { product: product.getProduct(), ...rest };
      })
    })
  });

  return await response.json();
}
