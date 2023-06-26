import { AddressSchema } from 'Checkout/stateMachines/CheckoutStateMachine';

export default (magentoSchema: any): AddressSchema | {} => {
  if (!magentoSchema) {
    return {};
  }
  return {
    email: magentoSchema.email,
    country: magentoSchema.country_id,
    street: magentoSchema.street[0],
    postCode: magentoSchema.postcode,
    city: magentoSchema.city,
    firstname: magentoSchema.firstname,
    lastname: magentoSchema.lastname,
    phone: magentoSchema.telephone
  };
};
