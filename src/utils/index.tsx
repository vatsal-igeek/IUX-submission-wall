//! This file contains utility functions for authentication and cookie management.
export const isAuthenticated = (accessToken:string | null) => {
  const token = getCookie('iux-token');
  // Check both localStorage token and Redux user state
  return !!(token || accessToken);
};

// Cookie utility functions

//! Get a cookie 
//? const token = getCookie('authToken');

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

//! Set a cookie
//? setCookie('authToken', 'your-token-here');

export const setCookie = (name: string, value: string): void => {
  document.cookie = `${name}=${value};path=/`;
};

//! Remove a cookie
//? removeCookie('authToken');

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

//! Clear all cookies
//? clearAllCookies();

export const clearAllCookies = (): void => {
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    removeCookie(name);
  });
};
