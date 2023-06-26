import { ChangeEvent, useEffect, useState } from 'react';
import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { Trash, Plus, Minus } from '@Core/icons';
import s from './CartItem.module.css';
import Item from '../../entities/Item';
import EnhancedImage from '@Core/components/EnhancedImage';
import { useCartCommand } from '@Checkout/providers/CheckoutCommandQueryProvider';
import usePrice from '@bigcommerce/storefront-data-hooks/use-price';
import { useCurrency } from '@Checkout/providers/CurrencyProvider';

const CartItem = ({ item }: { item: Item }) => {
  // const { price } = usePrice({
  //   amount: item.product.getPrice().actualPrice * item.quantity,
  //   baseAmount: item.product.getPrice().actualPrice * item.quantity,
  //   currencyCode: "USD",
  // })

  const { currencySymbol } = useCurrency();
  const price = `${currencySymbol}${item.product.getPrice().actualPrice * item.quantity}`;

  const { updateItemQuantity, removeItem } = useCartCommand();
  // const removeItem = useRemoveItem()
  const [quantity, setQuantity] = useState(item.quantity);
  const [removing, setRemoving] = useState(false);

  const updateQuantity = (val: number) => {
    updateItemQuantity && updateItemQuantity(item, val);
  };
  const handleQuantity = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);

    if (Number.isInteger(val) && val >= 0) {
      setQuantity(val);
      updateQuantity(val);
    }
  };
  const handleBlur = () => {
    const val = Number(quantity);

    if (val !== item.quantity) {
      updateQuantity(val);
    }
  };
  const increaseQuantity = (n = 1) => {
    const val = Number(quantity) + n;

    if (Number.isInteger(val) && val >= 0) {
      setQuantity(val);
      updateQuantity(val);
    }
  };
  const handleRemove = async () => {
    removeItem && removeItem(item);
  };

  useEffect(() => {
    // Reset the quantity state if the item quantity changes
    if (item.quantity !== Number(quantity)) {
      setQuantity(item.quantity);
    }
  }, [item.quantity]);

  return (
    <li
      className={cn('flex flex-row space-x-8 py-8', {
        'pointer-events-none opacity-75': removing
      })}
    >
      <div className="bg-violet relative h-16 w-16 overflow-hidden">
        <EnhancedImage
          className={s.productImage}
          image={item.product.getImages()[0]}
          src={item.product.getImages()[0].srcset[0].url}
          width={150}
          height={150}
          alt="Product Image"
          // The cart item image is already optimized and very small in size
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col text-base">
        {/** TODO: Replace this. No `path` found at Cart */}
        <Link href={`/product/${item.product.getUrlIdentifier()}`}>
          <span className="mb-5 cursor-pointer text-lg font-bold">{item.product.getName()}</span>
        </Link>

        <div className="flex items-center">
          <button type="button" onClick={() => increaseQuantity(-1)}>
            <Minus width={18} height={18} />
          </button>
          <input
            type="number"
            max={99}
            min={0}
            className={s.quantity}
            value={quantity}
            onChange={handleQuantity}
            onBlur={handleBlur}
          />
          <button type="button" onClick={() => increaseQuantity(1)}>
            <Plus width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-between space-y-2 text-base">
        <span>{price}</span>
        <button className="flex justify-end" onClick={handleRemove}>
          <Trash />
        </button>
      </div>
    </li>
  );
};

export default CartItem;
