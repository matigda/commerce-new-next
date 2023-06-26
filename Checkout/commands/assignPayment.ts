import { BillingContextSchema } from 'Checkout/stateMachines/CheckoutStateMachine';

export default async function assignPayment(
  billingData: BillingContextSchema,
  paymentMethod: string
) {
  const response = await fetch('/api/assign-payment', {
    method: 'POST',
    body: JSON.stringify({
      billingData,
      paymentMethod
    })
  });

  return await response.json();
}
