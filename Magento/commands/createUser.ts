export type RegistrationData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export default async function createUser(registrationData: RegistrationData) {
  return await fetch('http://local-magento.com/rest/V1/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer: {
        email: registrationData.email,
        firstname: registrationData.firstName,
        lastname: registrationData.lastName
      },
      password: registrationData.password
    })
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || data.message || 'HTTP error');
      }
      return data;
    })
  );
}
