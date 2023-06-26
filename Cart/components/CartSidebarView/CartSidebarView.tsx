import { FC } from 'react';
import cn from 'classnames';
import { Button, UserNav } from '@Core/components';
import { Bag, Check, Cross } from '@Core/icons';
import { useUI } from '@Core/components/context';
import CartItem from '../CartItem';
import s from './CartSidebarView.module.css';
import { useCartQuery } from '@Checkout/providers/CheckoutCommandQueryProvider';
import { useCurrency } from '@Checkout/providers/CurrencyProvider';
import { useRouter } from 'next/router';
import Item, { ItemStatus } from '@Cart/entities/Item';

const CartSidebarView: FC = () => {
  const { cart } = useCartQuery();
  const items: Item[] =
    (cart && cart.items.filter((item) => item.status !== ItemStatus.DELETED)) || [];
  const isEmpty = items.length < 1;

  const { currencySymbol } = useCurrency();
  const Router = useRouter();

  const total = `${currencySymbol}${cart?.totals?.cartTotalPrice}`;
  const subTotal = `${currencySymbol}${cart?.totals?.productsTotalPrice}`;
  const discount = `${currencySymbol}${cart?.totals?.discount}`;
  const shippingCost = cart?.totals?.shippingCost;

  const { closeSidebar } = useUI();
  const handleClose = () => closeSidebar();

  const error = null;
  const success = null;

  return (
    <div
      className={cn(s.root, {
        [s.empty]: error,
        [s.empty]: success,
        [s.empty]: isEmpty
      })}
    >
      <header className="px-4 pb-4 pt-6 sm:px-6">
        <div className="flex items-start justify-between space-x-3">
          <div className="flex h-7 items-center">
            <button
              onClick={handleClose}
              aria-label="Close panel"
              className="transition duration-150 ease-in-out hover:text-gray-500"
            >
              <Cross className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-1">
            <UserNav className="" />
          </div>
        </div>
      </header>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <span className="border-primary bg-secondary text-secondary relative flex h-16 w-16 items-center justify-center rounded-full border border-dashed p-12">
            <Bag className="absolute inset-auto" />
          </span>
          <h2 className="pt-6 text-center text-2xl font-bold tracking-wide">Your cart is empty</h2>
          <p className="text-accents-3 px-10 pt-2 text-center">
            Biscuit oat cake wafer icing ice cream tiramisu pudding cupcake.
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white">
            <Cross width={24} height={24} />
          </span>
          <h2 className="pt-6 text-center text-xl font-light">
            We couldn’t process the purchase. Please check your card information and try again.
          </h2>
        </div>
      ) : success ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white">
            <Check />
          </span>
          <h2 className="pt-6 text-center text-xl font-light">Thank you for your order.</h2>
        </div>
      ) : (
        <>
          <div className="flex-1 px-4 sm:px-6">
            <h2 className="pb-4 pt-1 text-2xl text-base font-bold leading-7 tracking-wide">
              My Cart
            </h2>
            <ul className="sm:divide-accents-3 border-accents-3 space-y-6 border-t py-6 sm:space-y-0 sm:divide-y sm:py-0">
              {items.map((item) => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 px-4  py-5 sm:px-6">
            <div className="border-accents-3 border-t">
              <ul className="py-3">
                <li className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>{subTotal}</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Discount</span>
                  <span>{discount}</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Estimated Shipping</span>
                  <span className="font-bold tracking-wide">
                    {shippingCost === 0 ? 'FREE' : `${currencySymbol}${shippingCost}`}
                  </span>
                </li>
              </ul>
              <div className="border-accents-3 mb-10 flex justify-between border-t py-3 font-bold">
                <span>Total</span>
                <span>{total}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                if (cart?.url) {
                  // @ts-ignore
                  window.location = cart.url;
                  return;
                }
                handleClose();
                Router.push('/checkout');
              }}
              width="100%"
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSidebarView;
