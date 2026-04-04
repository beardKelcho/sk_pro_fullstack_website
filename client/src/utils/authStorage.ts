export type StoredUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
};

type StorageKind = 'local' | 'session';

const getAvailableStorage = (kind: StorageKind): Storage | null => {
  if (typeof window === 'undefined') return null;
  return kind === 'local' ? window.localStorage : window.sessionStorage;
};

const getStoredValue = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
};

export const getStoredUser = (): StoredUser | null => {
  const storedUser = getStoredValue('user');
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

export const getStoredUserPermissions = (): string[] => {
  return getStoredUser()?.permissions || [];
};

export const getStoredAccessToken = (): string => {
  return getStoredValue('accessToken') || '';
};

export const getStoredRefreshToken = (): string => {
  return getStoredValue('refreshToken') || '';
};

export const setStoredAuth = (params: {
  user?: StoredUser | null;
  accessToken?: string;
  refreshToken?: string;
  rememberMe?: boolean;
}) => {
  const targetStorage = getAvailableStorage(params.rememberMe ? 'local' : 'session');
  const otherStorage = getAvailableStorage(params.rememberMe ? 'session' : 'local');

  if (!targetStorage || !otherStorage) return;

  otherStorage.removeItem('user');
  otherStorage.removeItem('accessToken');
  otherStorage.removeItem('refreshToken');

  if (params.user) {
    targetStorage.setItem('user', JSON.stringify(params.user));
  }

  if (params.accessToken) {
    targetStorage.setItem('accessToken', params.accessToken);
  }

  if (params.refreshToken) {
    targetStorage.setItem('refreshToken', params.refreshToken);
  }
};

export const updateStoredTokens = (params: {
  accessToken?: string;
  refreshToken?: string;
}) => {
  if (typeof window === 'undefined') return;

  const hasLocalUser = Boolean(window.localStorage.getItem('user'));
  const targetStorage = hasLocalUser ? window.localStorage : window.sessionStorage;

  if (params.accessToken) {
    targetStorage.setItem('accessToken', params.accessToken);
  }

  if (params.refreshToken) {
    targetStorage.setItem('refreshToken', params.refreshToken);
  }
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem('user');
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');

  window.sessionStorage.removeItem('user');
  window.sessionStorage.removeItem('accessToken');
  window.sessionStorage.removeItem('refreshToken');
};
