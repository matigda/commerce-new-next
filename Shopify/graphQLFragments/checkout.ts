export default `
        fragment CheckoutFragment on Checkout {
               id
               webUrl
               lineItemsSubtotalPrice {
                 amount
               }
               totalPriceV2 {
                 amount
               }
               shippingLine {
                priceV2 {
                  amount
                }
               }
               webUrl
               lineItems(first: 5) {
                 edges {
                   node {
                     id
                     variant {
                      priceV2 {
                        amount
                      }
                      id
                      sku
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        name: title
                        images(first: 10)  {
                          edges {
                            node {
                              altText
                              originalSrc
                              transformedSrc
                            }
                          }
                        }
                        handle
                        description
                      }
                     }
                     title
                     quantity
                   }
                 }
               }
          }
`;
