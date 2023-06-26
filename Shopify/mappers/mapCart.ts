import { ProductI, ProductType } from 'Product/entities/Product';
import Item, { ItemStatus, ServerItem } from 'Cart/entities/Item';
import {
  ServerCheckoutContextSchema,
  ShopifyShippingMethodSchema
} from 'Checkout/stateMachines/CheckoutStateMachine';
import mapImage from 'Shopify/mappers/mapImage';

const mapCart = (cartResponse: any): ServerCheckoutContextSchema<ShopifyShippingMethodSchema> => {
  const items: ServerItem[] = cartResponse.checkout.lineItems.edges.map((lineItem: any) => {
    const images = lineItem.node.variant.product.images.edges.map(mapImage);

    const product = {
      id: lineItem.node.variant.id,
      price: {
        actualPrice: lineItem.node.variant.priceV2.amount,
        currency: lineItem.node.variant.priceV2.currencyCode
      },
      sku: lineItem.node.variant.sku,
      name: lineItem.node.variant.title,
      description: lineItem.node.variant.product.description,
      urlIdentifier: lineItem.node.variant.product.handle,
      isDefault: true,
      type: ProductType.COMPLEX,
      image: images[0],
      images: images
    };

    return {
      cartItemId: lineItem.node.id,
      status: ItemStatus.FRESH,
      quantity: lineItem.node.quantity,
      product: {
        ...product,
        // it's made to not fetch all variant products, but also to make the logic behind state machine work
        variants: [product]
        //@TODO: probably can be done better
      }
    };
  });

  return {
    items: items,
    shipping: undefined,
    shippingMethods: [],
    webUrl: cartResponse.checkout.webUrl,
    totals: {
      cartTotalPrice: cartResponse.checkout.totalPriceV2.amount,
      productsTotalPrice: cartResponse.checkout.lineItemsSubtotalPrice.amount,
      discount: 0,
      shippingCost: cartResponse.checkout.shippingLine?.priceV2.amount ?? 0
    }
  };
};
export { mapCart };
