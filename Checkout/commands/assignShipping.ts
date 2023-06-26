import {
  ShippingContextSchema,
  ShippingMethodsType
} from 'Checkout/stateMachines/CheckoutStateMachine';

export default async function assignShipping<T extends ShippingMethodsType>(
  shippingData: ShippingContextSchema<T>
) {
  const response = await fetch('/api/assign-shipping', {
    method: 'POST',
    body: JSON.stringify({
      shippingData
    })
  });

  return await response.json();
}
