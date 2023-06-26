export default async function fetchPaymentMethods() {
  const response = await fetch('/api/fetch-payment-methods');

  return await response.json();
}
