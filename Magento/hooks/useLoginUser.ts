import loginUser, { LoginData } from 'Magento/commands/loginUser';
import Cookies from 'js-cookie';

export default function useLogInUser() {
  const logIn = async (loginData: LoginData): Promise<string> => {
    const token = await loginUser(loginData);
    Cookies.set('token', token, {
      secure: true
    });
    return token;
  };

  return { logIn };
}
