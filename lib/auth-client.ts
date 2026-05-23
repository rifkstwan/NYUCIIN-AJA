import Cookies from "js-cookie";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

export function saveAuth(token: string, user: object) {
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getUser() {
  const user = Cookies.get(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function logout() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!Cookies.get(TOKEN_KEY);
}