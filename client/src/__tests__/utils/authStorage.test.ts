import { getStoredUser, getStoredUserRole, getStoredUserPermissions, StoredUser } from '../../utils/authStorage';

// Mock window object
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('authStorage', () => {
  beforeEach(() => {
    // Reset mocks
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Setup window mocks
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  describe('getStoredUser', () => {
    it('should return null when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const result = getStoredUser();
      expect(result).toBeNull();
      
      global.window = originalWindow;
    });

    it('should return null when no user is stored', () => {
      const result = getStoredUser();
      expect(result).toBeNull();
    });

    it('should return user from localStorage', () => {
      const user: StoredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUser();
      expect(result).toEqual(user);
    });

    it('should return user from sessionStorage when localStorage is empty', () => {
      const user: StoredUser = {
        id: '456',
        name: 'Session User',
        email: 'session@example.com',
        role: 'USER',
      };
      mockSessionStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUser();
      expect(result).toEqual(user);
    });

    it('should prefer localStorage over sessionStorage', () => {
      const localUser: StoredUser = {
        id: '123',
        name: 'Local User',
        email: 'local@example.com',
        role: 'ADMIN',
      };
      const sessionUser: StoredUser = {
        id: '456',
        name: 'Session User',
        email: 'session@example.com',
        role: 'USER',
      };
      
      mockLocalStorage.setItem('user', JSON.stringify(localUser));
      mockSessionStorage.setItem('user', JSON.stringify(sessionUser));
      
      const result = getStoredUser();
      expect(result).toEqual(localUser);
    });

    it('should return null for invalid JSON', () => {
      mockLocalStorage.setItem('user', 'invalid-json');
      
      const result = getStoredUser();
      expect(result).toBeNull();
    });

    it('should handle user with _id instead of id', () => {
      const user: StoredUser = {
        _id: '789',
        name: 'User with _id',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUser();
      expect(result).toEqual(user);
    });

    it('should handle user with permissions', () => {
      const user: StoredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        permissions: ['PROJECT_CREATE', 'PROJECT_UPDATE'],
        isActive: true,
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUser();
      expect(result).toEqual(user);
      expect(result?.permissions).toEqual(['PROJECT_CREATE', 'PROJECT_UPDATE']);
      expect(result?.isActive).toBe(true);
    });
  });

  describe('getStoredUserRole', () => {
    it('should return empty string when no user is stored', () => {
      const result = getStoredUserRole();
      expect(result).toBe('');
    });

    it('should return user role from localStorage', () => {
      const user: StoredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUserRole();
      expect(result).toBe('ADMIN');
    });

    it('should return empty string when user has no role', () => {
      const user: StoredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUserRole();
      expect(result).toBe('');
    });
  });

  describe('getStoredUserPermissions', () => {
    it('should return empty array when no user is stored', () => {
      const result = getStoredUserPermissions();
      expect(result).toEqual([]);
    });

    it('should return user permissions from localStorage', () => {
      const user: StoredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        permissions: ['PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE'],
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUserPermissions();
      expect(result).toEqual(['PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE']);
    });

    it('should return empty array when user has no permissions', () => {
      const user: StoredUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      };
      mockLocalStorage.setItem('user', JSON.stringify(user));
      
      const result = getStoredUserPermissions();
      expect(result).toEqual([]);
    });
  });
});
