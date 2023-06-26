import ProductI, { ProductMethods } from '@Product/entities/Product';

export enum ItemStatus {
  FRESH,
  ADDED,
  UPDATED,
  DELETED
}

export default interface Item {
  previousQuantity?: number; // ONLY FOR BACKEND UPDATE FAIL, NOT OFFLINE MODE (in case we need to revert UI after update quantity didn't work)
  status: ItemStatus;
  product: ProductMethods;
  quantity: number;
  cartItemId?: number | string;
}

export interface ServerItem {
  previousQuantity?: number; // ONLY FOR BACKEND UPDATE FAIL, NOT OFFLINE MODE (in case we need to revert UI after update quantity didn't work)
  status: ItemStatus;
  product: ProductI;
  quantity: number;
  cartItemId?: number | string;
}

export interface SerializedItem {
  product: ProductI;
  status: ItemStatus;
  quantity: number;
  cartItemId?: number | string;
}
