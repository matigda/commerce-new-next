export type LoginData = {
  email: string;
  password: string;
};

export default async function loginUser(loginData: LoginData) {
  return await fetch('http://local-magento.com/rest/V1/integration/customer/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: loginData.password,
      username: loginData.email
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
