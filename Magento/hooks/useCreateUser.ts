import createUser, { RegistrationData } from 'Magento/commands/createUser';

export default function useCreateUser() {
  const create = (registrationData: RegistrationData) => {
    createUser(registrationData);
  };

  return { create };
}
