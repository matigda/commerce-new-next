import { actions, assign, EventObject, Machine, MachineConfig, send, StateSchema } from 'xstate';
import Item, { ItemStatus, ServerItem } from 'Cart/entities/Item';
import Cookies from 'js-cookie';
import addProductToCart from 'Checkout/commands/addProductToCart';
import updateItemQuantity from 'Checkout/commands/updateItemQuantity';
import removeItemFromCart from 'Checkout/commands/removeItemFromCart';
import applyCoupon from 'Checkout/commands/applyCoupon';
import removeCoupon from 'Checkout/commands/removeCoupon';
import assignShipping from 'Checkout/commands/assignShipping';
import fetchPaymentMethods from 'Checkout/queries/fetchPaymentMethods';
import assignPayment from 'Checkout/commands/assignPayment';
import fetchCartQuery from 'Checkout/queries/fetchCart';
import mergeCarts from 'Checkout/commands/mergeCarts';
import mapCart from 'Magento/mappers/mapCart';
import { ComplexProduct, ProductMethods, ProductType } from 'Product/entities/Product';

const { cancel } = actions;

export enum EventId {
  ASSIGN_PAYMENT_METHODS = 'ASSIGN_PAYMENT_METHODS',
  ASSIGN_SHIPPING = 'ASSIGN_SHIPPING',
  UPDATE_SHIPPING = 'UPDATE_SHIPPING',
  ORDER_CREATED = 'ORDER_CREATED',
  ASSIGN_PAYMENT = 'ASSIGN_PAYMENT',
  UPDATE_PAYMENT = 'UPDATE_PAYMENT',
  APPLY_COUPON = 'APPLY_COUPON',
  REMOVE_COUPON = 'REMOVE_COUPON',
  PLACE_ORDER = 'PLACE_ORDER',
  ADD_PRODUCT = 'ADD_PRODUCT',
  ADD_PRODUCTS = 'ADD_PRODUCTS',
  PRODUCT_ADDING_FAILED = 'PRODUCT_ADDING_FAILED',
  REMOVE_PRODUCT = 'REMOVE_PRODUCT',
  FETCH_PAYMENT_METHODS = 'FETCH_PAYMENT_METHODS',
  UPDATE_ITEM_QUANTITY = 'UPDATE_ITEM_QUANTITY',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  SET_CART = 'SET_CART',
  ASSIGN_SHIPPING_FAILED = 'ASSIGN_SHIPPING_FAILED',
  ASSIGN_CHECKOUT_URL = 'ASSIGN_CHECKOUT_URL',
  MERGE_CARTS = 'MERGE_CARTS',
  CARTS_MERGED = 'CARTS_MERGED'
}

export interface CheckoutEventSchema extends EventObject {
  type: EventId;
  payload?: any;
  data?: any;
  cartId?: string; // it's here because we cannot get it from context in children services as we are using closures and context used in callback is not updated
  token?: string; // it's here because we cannot get it from context in children services as we are using closures and context used in callback is not updated
}

interface ItemsStateSchema extends StateSchema {
  states: {
    idle: {};
    loading: {};
    productAddingFailed: {};
  };
}
interface MainStateSchema extends StateSchema {
  states: {
    master: {};
    cart: {};
    shippingAssigned: {};
    paymentAssigned: {};
  };
}

interface CheckoutStateSchema extends StateSchema {
  states: {
    main: MainStateSchema;
    items: ItemsStateSchema;
  };
}

interface AdditionalUIShippingFields {
  title: string;
}

export interface MagentoShippingMethodSchema extends AdditionalUIShippingFields {
  amount: number;
  available: boolean;
  base_amount: number;
  carrier_code: string;
  carrier_title: string;
  error_message: string;
  method_code: string;
  method_title: string;
  price_excl_tax: number;
  price_incl_tax: number;
}

export interface ShopifyShippingMethodSchema extends AdditionalUIShippingFields {
  whateverTheHellGoesHere: string; // @TODO: add real data from shopify
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export type ShippingMethodsType = XOR<MagentoShippingMethodSchema, ShopifyShippingMethodSchema>;

export interface AddressSchema {
  email?: string;
  firstname?: string;
  lastname?: string;
  postCode?: string;
  street?: string;
  country?: string;
  phone?: string;
  city?: string;
}

export interface ShippingContextSchema<A extends ShippingMethodsType> extends AddressSchema {
  shippingMethod?: A;
}

// @TODO: make it generic like ShippingMethodsType
export interface BillingContextSchema extends AddressSchema {
  paymentMethod?: [];
}

export type Totals = {
  cartTotalPrice: number;
  productsTotalPrice: number;
  discount: number;
  shippingCost: number;
  tax?: number;
  couponCode?: number;
};

export interface CheckoutContextSchema<A extends ShippingMethodsType> {
  lastError?: string;
  token?: string;
  url?: string;
  country?: string;
  totals?: Totals;
  shipping?: ShippingContextSchema<A>;
  billing?: BillingContextSchema;
  items: Item[];
  shippingMethods?: A[];
  paymentMethods?: [];
  webUrl?: string;
  shippingAddressIsAssigned?: boolean;
}
export interface ServerCheckoutContextSchema<A extends ShippingMethodsType> {
  lastError?: string;
  token?: string;
  url?: string;
  country?: string;
  totals: Totals;
  shipping?: ShippingContextSchema<A>;
  billing?: BillingContextSchema;
  items: ServerItem[];
  shippingMethods?: A[];
  webUrl?: string;
  paymentMethods?: [];
  shippingAddressIsAssigned?: boolean;
}

const promise = (ms: number, data: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

const compareProducts = (product1: ProductMethods, product2: ProductMethods): boolean => {
  if (
    product1.getProductType() === ProductType.SIMPLE &&
    product2.getProductType() === ProductType.SIMPLE
  ) {
    return product1.getUrlIdentifier() === product2.getUrlIdentifier();
  }

  if (
    product1.getProductType() === ProductType.COMPLEX &&
    product2.getProductType() === ProductType.COMPLEX
  ) {
    return (
      (product1 as ComplexProduct).getPickedVariant()?.getSku() ===
      (product2 as ComplexProduct).getPickedVariant()?.getSku()
    );
  }

  // @TODO: warunek dla composed product

  return false;
};

const productEvents = {
  [EventId.ADD_PRODUCTS]: {
    target: 'loading',
    actions: ['assignItemsToCart', 'addItemBackendCall']
  },
  [EventId.ADD_PRODUCT]: [
    {
      target: 'idle',
      actions: ['assignItemToCart', 'saveOfflineCartInCookies'],
      cond: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) => {
        return (
          !window.navigator.onLine &&
          !context.items.find(
            (item) => item.product.getUrlIdentifier() === event.payload.product.getUrlIdentifier()
          )
        );
      }
    },
    {
      target: 'idle',
      actions: ['updateExistingItemQuantity', 'saveOfflineCartInCookies'],
      cond: () => !window.navigator.onLine
    },
    {
      target: 'loading',
      actions: ['assignItemToCart', 'addItemBackendCall'],
      cond: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) => {
        return !context.items.find((item) => {
          return compareProducts(event.payload.product, item.product);
        });
      }
    },
    {
      target: 'loading',
      actions: ['updateExistingItemQuantity', 'addItemBackendCall']
    }
  ],
  [EventId.REMOVE_PRODUCT]: [
    {
      target: 'idle',
      actions: ['removeItemFromCart', 'saveOfflineCartInCookies'],
      cond: () => !window.navigator.onLine
    },
    {
      target: 'loading',
      actions: ['removeItemFromCart', 'removeItemBackendCall']
    }
  ],
  [EventId.UPDATE_ITEM_QUANTITY]: [
    {
      target: 'idle',
      actions: ['updateItemQuantity', 'saveOfflineCartInCookies'],
      cond: () => !window.navigator.onLine
    },
    {
      target: 'loading',
      actions: ['updateItemQuantity', 'cancelDebouncedUpdate', 'updateItemBackendCall']
    }
  ]
};

const cartItemsState: MachineConfig<
  CheckoutContextSchema<ShippingMethodsType>,
  ItemsStateSchema,
  CheckoutEventSchema
> = {
  initial: 'idle',
  invoke: {
    id: 'itemsService',
    src: 'itemsService'
  },
  states: {
    idle: {
      on: productEvents
    },
    productAddingFailed: {
      after: {
        1: [{ target: 'idle' }]
      }
    },
    loading: {
      on: {
        [EventId.SET_CART]: {
          target: 'idle',
          actions: ['assignCart']
        },
        [EventId.PRODUCT_ADDING_FAILED]: {
          target: 'productAddingFailed',
          actions: ['removeLocalProductFromCart']
        },
        [EventId.UPDATE_ITEM_QUANTITY]: {
          target: 'loading',
          actions: ['updateItemQuantity', 'cancelDebouncedUpdate', 'updateItemBackendCall']
        },
        [EventId.FAIL]: 'idle'
      }
    }
  }
};

const mainState: MachineConfig<
  CheckoutContextSchema<ShippingMethodsType>,
  MainStateSchema,
  CheckoutEventSchema
> = {
  initial: 'master',
  invoke: {
    id: 'checkoutService',
    src: 'checkoutService'
  },
  states: {
    master: {
      invoke: {
        src: async () => {
          if (!process.browser && process.env.NODE_ENV !== 'test') {
            return {
              products: [],
              shipping: {}
            };
          }
          return await fetchCartQuery();
        },
        onDone: [
          {
            target: 'shippingAssigned',
            cond: (context: any, event: any) => event.data.shippingAddressIsAssigned,
            actions: ['assignCart', 'fetchPaymentMethods']
          },
          { target: 'cart', actions: ['assignCart'] }
        ]
      }
    },

    // couponApplied: {
    //     always: [
    //         {target: 'master'}
    //     ]
    // },
    cart: {
      on: {
        [EventId.ASSIGN_CHECKOUT_URL]: {
          target: 'cart',
          actions: ['assignCheckoutUrl']
        },
        [EventId.REMOVE_COUPON]: {
          target: 'cart',
          actions: ['removeCoupon', 'removeCouponBackendCall']
        },
        [EventId.APPLY_COUPON]: {
          // cond: (context: any, event: any) => event.data.shippingAddressIsAssigned,
          target: 'cart',
          actions: ['applyCoupon']
        },
        [EventId.ASSIGN_SHIPPING]: {
          target: 'shippingAssigned',
          actions: ['assignShipping', 'assignShippingBackendCall']
        },
        [EventId.MERGE_CARTS]: {
          target: 'cart',
          actions: ['assignToken', 'mergeCarts'],
          cond: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
            !context.token // check if we are still at guest cart
        },
        [EventId.CARTS_MERGED]: {
          target: 'master'
        }
      }
    },
    shippingAssigned: {
      on: {
        [EventId.ASSIGN_CHECKOUT_URL]: {
          target: 'shippingAssigned',
          actions: ['assignCheckoutUrl']
        },
        [EventId.REMOVE_COUPON]: {
          target: 'shippingAssigned',
          actions: ['removeCoupon', 'removeCouponBackendCall']
        },
        [EventId.APPLY_COUPON]: {
          target: 'shippingAssigned',
          actions: ['applyCoupon']
        },
        [EventId.ASSIGN_PAYMENT_METHODS]: {
          target: 'shippingAssigned',
          actions: ['assignPayment']
        },
        [EventId.ASSIGN_SHIPPING_FAILED]: {
          target: 'cart'
        },
        [EventId.ASSIGN_PAYMENT]: {
          target: 'paymentAssigned',
          actions: ['assignPayment', 'assignPaymentBackendCall']
        },
        [EventId.UPDATE_SHIPPING]: {
          target: 'shippingAssigned',
          actions: ['assignShipping', 'assignShippingBackendCall']
        },
        [EventId.FAIL]: 'cart',

        [EventId.MERGE_CARTS]: {
          target: 'master',
          actions: ['mergeCarts'],
          cond: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
            !context.token // check if we are still at guest cart
        }
      }
    },
    paymentAssigned: {
      on: {
        [EventId.UPDATE_PAYMENT]: 'paymentAssigned',
        [EventId.UPDATE_SHIPPING]: 'paymentAssigned',
        [EventId.ORDER_CREATED]: {
          target: 'master',
          actions: ['resetLocalData']
        }
      }
    }
  }
};

const CheckoutStateMachine = Machine<
  CheckoutContextSchema<ShippingMethodsType>,
  CheckoutStateSchema,
  CheckoutEventSchema
>(
  {
    id: 'checkouteee',

    type: 'parallel',
    context: {
      lastError: '',
      token: '',
      country: '',
      totals: undefined,
      shipping: {},
      billing: {},
      shippingMethods: [],
      items: [],
      url: undefined
    },
    states: {
      items: cartItemsState,
      main: mainState
    }
  },
  {
    services: {
      itemsService:
        (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
        (cb: (event: object) => void, onReceive: any) => {
          onReceive(async (event: CheckoutEventSchema) => {
            if (event.type === EventId.ADD_PRODUCT) {
              addProductToCart(event.payload.product, event.payload.quantity)
                .then((result) => {
                  cb({ type: EventId.SET_CART, data: { ...mapCart(result) } });
                })
                .catch((error) =>
                  cb({
                    type: EventId.PRODUCT_ADDING_FAILED,
                    payload: { product: event.payload.product, error: error.message }
                  })
                );
            }

            if (event.type === EventId.UPDATE_ITEM_QUANTITY) {
              updateItemQuantity(event.payload.item, event.payload.quantity).then((result) => {
                cb({ type: EventId.SET_CART, data: { ...mapCart(result) } });
              });
            }

            if (event.type === EventId.REMOVE_PRODUCT) {
              removeItemFromCart(event.payload.item)
                .then((result) => {
                  cb({ type: EventId.SET_CART, data: { ...mapCart(result) } });
                })
                .catch((error) => cb({ type: EventId.FAIL, error })); // @TODO - if this actions is called ( EventId.FAIL ) then bring product back to cart ( context -> items )
            }
          });
        },
      checkoutService:
        (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
        (cb: (event: object) => void, onReceive: any) => {
          onReceive(async (event: CheckoutEventSchema) => {
            if (event.type === EventId.APPLY_COUPON) {
              applyCoupon(event.payload.couponCode).then((result) => {
                cb({ type: EventId.SET_CART, data: { ...mapCart(result) } });
              });
            }
            if (event.type === EventId.REMOVE_COUPON) {
              removeCoupon().then((result) => {
                cb({ type: EventId.SET_CART, data: { ...mapCart(result) } });
              });
            }

            if (event.type === EventId.ASSIGN_SHIPPING) {
              assignShipping(event.payload.shipping)
                .then((paymentMethods) =>
                  cb({ type: EventId.ASSIGN_PAYMENT_METHODS, payload: { paymentMethods } })
                )
                .catch((result) => cb({ type: EventId.ASSIGN_SHIPPING_FAILED, result }));
            }

            if (event.type === EventId.FETCH_PAYMENT_METHODS) {
              fetchPaymentMethods().then((paymentMethods) =>
                cb({ type: EventId.ASSIGN_PAYMENT_METHODS, payload: { paymentMethods } })
              );
            }

            if (event.type === EventId.ASSIGN_PAYMENT) {
              assignPayment(event.payload, event.payload.paymentMethod.code).then(() => {
                cb({ type: EventId.ORDER_CREATED });
              });
              //     .catch(result => cb({ type: EventId.FAIL, result }))
            }

            if (event.type === EventId.MERGE_CARTS) {
              mergeCarts(event.payload.items).then(() => {
                cb({ type: EventId.CARTS_MERGED });
              });

              // const customerCartId = await createCart(event.token) as string;
              //
              // cb({type: EventId.ASSIGN_CART_ID, payload: {cartId: customerCartId}})
              //
              // await Promise.all(event.payload.items.map((item: Item) => addProductToCart(item.product, item.quantity)));
              //
              // cb({type: EventId.CARTS_MERGED})

              // await mergeCarts(event.payload.cartId!, customerCartId, event.token!);

              // cb({type: EventId.CARTS_MERGED})

              // @OLD:
              // mamy id starego koszyka... czyli po logowaniu musimy usunąć id
              // cb({type: EventId.ASSIGN_CART_ID, payload: {cartId: null}})  -> do sprawdzenia ta linijka!
              // jeśli customer ma w swoim koszyku 4 itemy a jako guest ma 5, to po zalogowaniu ma 9
              // jedyne co trzeba zrobić to dodać te produkty batchowo - żeby się koszyk nie pobierał po dodaniu każdego jednego produktu

              // event.payload.items.forEach((item: Item) => {
              //     cb({type: EventId.ADD_PRODUCT, token: event.token, payload: {...item} })
              // })
            }
          });
        }
    },
    actions: {
      assignShipping: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        shipping: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => ({ ...context.shipping, ...event.payload.shipping }),

        // @TODO: make form for billing address and put proper data here
        billing: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          return { ...context.billing, ...event.payload.shipping };
        }
      }),
      assignShippingBackendCall: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.ASSIGN_SHIPPING,
          payload: e.payload,
          token: context.token
        }),
        { to: 'checkoutService' }
      ),
      assignPayment: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        billing: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => ({ ...context.billing, ...event.payload.paymentData }),
        paymentMethods: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => event.payload.paymentMethods
      }),
      assignPaymentBackendCall: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.ASSIGN_PAYMENT,
          payload: { ...e.payload, ...context.billing },
          token: context.token
        }),
        { to: 'checkoutService' }
      ),
      addItemBackendCall: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.ADD_PRODUCT,
          payload: e.payload,
          token: context.token
        }),
        { to: 'itemsService' }
      ),
      applyCoupon: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.APPLY_COUPON,
          payload: e.payload,
          token: context.token
        }),
        { to: 'checkoutService' }
      ),
      removeCoupon: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({}),
      removeCouponBackendCall: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.REMOVE_COUPON,
          payload: e.payload,
          token: context.token
        }),
        { to: 'checkoutService' }
      ),
      assignItemsToCart: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => [event.payload.items, ...context.items],
        totals: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          return {
            tax: context.totals?.tax,
            productsTotalPrice:
              event.payload.product.getPrice().actualPrice +
              (context.totals?.productsTotalPrice ?? 0),
            discount: 0,
            cartTotalPrice:
              event.payload.product.getPrice().actualPrice + (context.totals?.cartTotalPrice ?? 0),
            shippingCost: 0
          };
        }
      }), // optimistic UI update
      assignItemToCart: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => [{ ...event.payload, status: ItemStatus.ADDED }, ...context.items],
        totals: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          return {
            tax: context.totals?.tax,
            productsTotalPrice:
              event.payload.product.getPrice().actualPrice +
              (context.totals?.productsTotalPrice ?? 0),
            discount: 0,
            cartTotalPrice:
              event.payload.product.getPrice().actualPrice + (context.totals?.cartTotalPrice ?? 0),
            shippingCost: 0
          };
        }
      }), // optimistic UI update
      updateExistingItemQuantity: assign<
        CheckoutContextSchema<ShippingMethodsType>,
        CheckoutEventSchema
      >({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          // we are sure that we will find this item because of the condition set in transition
          const index: any = context.items.findIndex((item) => {
            return compareProducts(item.product, event.payload.product);
          });
          context.items[index].previousQuantity = context.items[index].quantity;
          context.items[index].quantity += event.payload.quantity;
          context.items[index].status = ItemStatus.UPDATED;
          return [...context.items];
        }
      }), // optimistic UI update
      updateItemQuantity: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          const index: any = context.items.findIndex((item) => {
            return compareProducts(item.product, event.payload.item.product);
          });
          context.items[index].previousQuantity = context.items[index].quantity;
          context.items[index].quantity = event.payload.quantity;
          context.items[index].status = ItemStatus.UPDATED;
          return [...context.items];
        }
      }), // optimistic UI update
      updateItemBackendCall: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.UPDATE_ITEM_QUANTITY,
          payload: e.payload,
          token: context.token
        }),
        { to: 'itemsService', delay: 450, id: 'debounced-update' }
      ),
      removeItemBackendCall: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.REMOVE_PRODUCT,
          payload: e.payload,
          token: context.token
        }),
        { to: 'itemsService' }
      ),
      fetchPaymentMethods: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.FETCH_PAYMENT_METHODS,
          payload: e.payload,
          token: context.token
        }),
        { to: 'checkoutService' }
      ),
      mergeCarts: send(
        (context: CheckoutContextSchema<ShippingMethodsType>, e: CheckoutEventSchema) => ({
          type: EventId.MERGE_CARTS,
          payload: { items: context.items },
          token: e.token
        }),
        { to: 'checkoutService' }
      ),
      saveOfflineCartInCookies: (context, event) => {
        Cookies.set(
          'offlineCart',
          context.items
            .filter((item) => item.status !== ItemStatus.FRESH)
            .map((item) => ({
              sku: item.product.getSku(),
              quantity: item.quantity,
              cartItemId: item.cartItemId,
              status: item.status
            }))
        );
      },
      assignToken: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        token: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
          event.token
      }),
      assignCheckoutUrl: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        url: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
          event.payload.url
      }),
      removeLocalProductFromCart: assign<
        CheckoutContextSchema<ShippingMethodsType>,
        CheckoutEventSchema
      >({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          return context.items.filter(
            (item: Item) => !compareProducts(item.product, event.payload.product)
          );
        },
        lastError: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          return event.payload.error;
        }
      }),
      removeItemFromCart: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => {
          console.log('NO WITAM', event);
          const item: Item = context.items.find((item: Item) =>
            compareProducts(item.product, event.payload.item.product)
          )!;
          item.status = ItemStatus.DELETED;
          console.log('============>', item);
          console.log('V2 ============>', context.items);

          return context.items;
        }
      }), // optimistic UI update
      assignCart: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        shipping: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => event.data.shipping,
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ): Item[] => {
          console.log('=======================>', event);
          return event.data.items;
        },
        shippingMethods: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => event.data.shippingMethods,
        billing: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => event.data.billing,
        totals: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
          event.data.totals,
        url: (context: CheckoutContextSchema<ShippingMethodsType>, event: CheckoutEventSchema) =>
          event.data.webUrl
      }),
      cancelDebouncedUpdate: cancel('debounced-update'),
      resetLocalData: assign<CheckoutContextSchema<ShippingMethodsType>, CheckoutEventSchema>({
        items: (
          context: CheckoutContextSchema<ShippingMethodsType>,
          event: CheckoutEventSchema
        ) => []
      })
    }
  }
);

export default CheckoutStateMachine;
