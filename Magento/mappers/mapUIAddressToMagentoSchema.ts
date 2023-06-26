import {
  BillingContextSchema,
  MagentoShippingMethodSchema,
  ShippingContextSchema,
  XOR
} from '../../Checkout/stateMachines/CheckoutStateMachine';

export default (
  address: XOR<ShippingContextSchema<MagentoShippingMethodSchema>, BillingContextSchema>
) => {
  return {
    email: address.email,
    country_id: address.country,
    street: [address.street],
    postcode: address.postCode,
    city: address.city,
    firstname: address.firstname,
    lastname: address.lastname,
    telephone: address.phone
    // company: address.companyName,
    // vat_id: address.vatId
  };
};
