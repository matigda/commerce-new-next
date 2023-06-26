export default async function applyCoupon(couponCode: string) {
  const response = await fetch('/api/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({
      couponCode
    })
  });

  return await response.json();
}
