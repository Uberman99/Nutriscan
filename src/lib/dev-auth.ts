// src/lib/dev-auth.ts
// Utility to detect dev mode and provide a dev user for local testing

export const isDevAuth = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'development';
  }
  return false;
};

export const getDevUser = () => ({
  id: 'dev-user',
  firstName: 'Dev',
  lastName: 'User',
  email: 'dev@localhost',
  isSignedIn: true,
});
