export type StoredUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = window.localStorage.getItem('user') || window.sessionStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    return null;
  }
};

export const getStoredUserRole = (): string => {
  return getStoredUser()?.role || '';
};

