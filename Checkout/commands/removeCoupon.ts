export default async function removeCoupon() {
  const response = await fetch('/api/remove-coupon', {
    method: 'DELETE'
  });

  return await response.json();
}
