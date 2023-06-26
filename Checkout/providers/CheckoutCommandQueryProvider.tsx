'use client';

import React, { useContext, useEffect } from 'react';
import ProductI, { productFactory, ProductMethods } from 'Product/entities/Product';
import CheckoutStateMachine, {
  CheckoutContextSchema,
  EventId,
  ShippingContextSchema,
  ShippingMethodsType
} from '../stateMachines/CheckoutStateMachine';
// import {from} from 'rxjs';
// import {interpret} from "xstate";
import { useMachine } from '@xstate/react';
import Cookies from 'js-cookie';
import Item, { ItemStatus } from 'Cart/entities/Item';
import fetchProducts from 'Shopify/queries/fetchProducts';

type CommandContextProps = {
  mergeGuestCheckoutWithCustomerCheckout: (token: string) => void;
  mergeCarts: () => void;
  addProduct: (product: ProductMethods, quantity: number) => void;
  updateItemQuantity: (item: Item, quantity: number) => void;
  removeItem: (item: Item) => void;
  applyCoupon: (couponCode: string) => void;
  removeCoupon: () => void;
  assignShipping: (shippingData: object) => void;
  assignPayment: (paymentData: object) => void;
};

type QueryContextProps = {
  cart: CheckoutContextSchema<ShippingMethodsType>;
  itemsAmount: number;
  matches: (state: string) => boolean;
  isLoading: boolean;
};

// const CommandContext = React.createContext<Partial<CommandContextProps>>({});

// const QueryContext = React.createContext<Partial<{
//     cart: CheckoutContextSchema<ShippingMethodsType>,
//     matches:  (state: string) => boolean,
//     isLoading: boolean,
//     subscribe: (cb: (state: StateType) => void) => void
// }>>({});

// const resolvedMachine = interpret(CheckoutStateMachine.withConfig(magentoStateMachineConfig)).start();

// const CartQueryProvider = ({children} : {children: React.ReactElement}) => {
//     let {state: currentStateFromMachine} = resolvedMachine;
//     const stateRXObserver = from(resolvedMachine as any);
//     const [state, setState] = useState<StateType>(currentStateFromMachine);
//
//     useEffect(() => {
//         stateRXObserver.subscribe((state: any) => {
//             setState(state);
//         });
//
//     }, [])
//
//     return (
//         <QueryContext.Provider
//         value={{
//             cart: state.context,
//             matches: state.matches,
//             isLoading: state.matches(`items.loading`),
//             subscribe: (cb: (state: any) => void) => {
//                 stateRXObserver.subscribe(cb);
//             }
//         }}
//         >
//             {children}
//         </QueryContext.Provider>
//     )
// }

// const CartCommandProvider = ({children} : {children: React.ReactElement}) => {
//
//     const {send} = resolvedMachine;
//
//     const removeProduct = (product: Product) => {
//         send(EventId.REMOVE_PRODUCT, {payload: {product}})
//
//     }
//     const addProduct = (product: Product, quantity: number) => {
//         send(EventId.ADD_PRODUCT, { payload: { product, quantity } });
//     }
//
//     const assignShipping = (shippingData: object) => {
//         send(EventId.ASSIGN_SHIPPING, { payload: { shipping: shippingData }})
//     }
//
//     const assignPayment = (paymentData: object) => {
//         send({ type: EventId.ASSIGN_PAYMENT }, { payload: { payment: paymentData }});
//     }
//
//     return <CommandContext.Provider
//         value={{
//             addProduct,
//             removeProduct,
//             assignShipping,
//             assignPayment
//         }}
// >
//     {children}
//     </CommandContext.Provider>
// };

const CheckoutCommandContext = React.createContext<Partial<CommandContextProps>>({});
const CheckoutQueryContext = React.createContext<Partial<QueryContextProps>>({});

const TestProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, send] = useMachine(CheckoutStateMachine, {
    context: {
      country: 'PL'
    }
  });

  useEffect(() => {
    if (state.matches('items.productAddingFailed')) {
      alert(state.context.lastError);
    }

    if (state.matches('main.cart') && state.matches('items.idle') && window.navigator.onLine) {
      const cart = Cookies.get('offlineCart');
      if (!cart) {
        return;
      }
      const parsedCart = JSON.parse(cart);

      Cookies.remove('offlineCart');

      // @ts-ignore
      fetchProducts({ skus: parsedCart.map((item) => item.sku) }).then((products: ProductI[]) => {
        // @ts-ignore
        parsedCart.forEach((item) => {
          item.product = productFactory(products.find((product) => product.sku === item.sku)!);
          switch (item.status) {
            case ItemStatus.UPDATED:
              updateItemQuantity(item, item.quantity);
              break;
            case ItemStatus.ADDED:
              addProduct(item.product, item.quantity);
              break;
            case ItemStatus.DELETED:
              removeItem(item);
              break;
          }
        });
      });
    }
  }, [state]);

  const removeItem = (item: Item) => {
    send(EventId.REMOVE_PRODUCT, { payload: { item } });
  };

  const addProduct = (product: ProductMethods, quantity: number) => {
    send(EventId.ADD_PRODUCT, { payload: { product, quantity, status: ItemStatus.ADDED } });
  };

  const updateItemQuantity = (item: Item, quantity: number) => {
    send(EventId.UPDATE_ITEM_QUANTITY, { payload: { item, quantity, status: ItemStatus.UPDATED } });
  };

  const mergeCarts = () => {
    send(EventId.MERGE_CARTS);
  };

  const assignShipping = (shippingData: ShippingContextSchema<ShippingMethodsType>) => {
    if (state.matches('main.cart')) {
      send(EventId.ASSIGN_SHIPPING, { payload: { shipping: shippingData } });
    } else {
      send(EventId.UPDATE_SHIPPING, { payload: { shipping: shippingData } });
    }
  };

  const assignPayment = (paymentData: object) => {
    send(EventId.ASSIGN_PAYMENT, { payload: paymentData });
  };

  // it can happen in one of following states - "cart" or "shippingAssigned"
  const mergeGuestCheckoutWithCustomerCheckout = () => {
    send(EventId.MERGE_CARTS);
  };

  const applyCoupon = (couponCode: string) => {
    send(EventId.APPLY_COUPON, { payload: { couponCode } });
  };

  const removeCoupon = () => {
    send(EventId.REMOVE_COUPON);
  };

  return (
    <CheckoutCommandContext.Provider
      value={{
        addProduct,
        updateItemQuantity,
        removeItem,
        assignShipping,
        assignPayment,
        applyCoupon,
        removeCoupon,
        mergeGuestCheckoutWithCustomerCheckout,
        mergeCarts
      }}
    >
      <CheckoutQueryContext.Provider
        value={{
          cart: state.context,
          itemsAmount: state.context.items.reduce((acc, curr) => {
            return acc + curr.quantity;
          }, 0),
          matches: state.matches,
          isLoading: state.matches(`items.loading`)
        }}
      >
        {children}
      </CheckoutQueryContext.Provider>
    </CheckoutCommandContext.Provider>
  );
};

export const useCartCommand = () => {
  return useContext(CheckoutCommandContext); //, 0);
};
export const useCartQuery = () => {
  return useContext(CheckoutQueryContext);
};

export { TestProvider };
