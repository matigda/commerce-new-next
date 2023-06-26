export default async function mergeCarts(
  guestCartId: string,
  customerCartId: string,
  token: string
) {
  const query = `mutation MergeCarts($sourceCartId: String!, $destinationCartId: String!) {
        mergeCarts(source_cart_id: $sourceCartId, destination_cart_id: $destinationCartId) {
            items {
                id
                quantity
            }
        }
    }`;

  return await fetch('http://local-magento.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables: { destinationCartId: customerCartId, sourceCartId: guestCartId }
    })
  })
    .then((r) => r.json())
    .then((data) => console.log('data returned:', data));
}
