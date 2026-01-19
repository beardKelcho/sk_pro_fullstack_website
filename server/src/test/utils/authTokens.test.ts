import { createTokenHash, generateTokenPair, isMobileClient, JWT_SECRET, JWT_REFRESH_SECRET } from '../../utils/authTokens';
import jwt from 'jsonwebtoken';
import { IUser } from '../../models/User';
import mongoose from 'mongoose';

describe('authTokens', () => {
  describe('createTokenHash', () => {
    it('should create a SHA256 hash of the token', () => {
      const token = 'test-token-123';
      const hash = createTokenHash(token);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 produces 64 hex characters
    });

    it('should produce consistent hashes for the same token', () => {
      const token = 'test-token-123';
      const hash1 = createTokenHash(token);
      const hash2 = createTokenHash(token);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = createTokenHash('token-1');
      const hash2 = createTokenHash('token-2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateTokenPair', () => {
    const mockUser: Partial<IUser> = {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      email: 'test@example.com',
      role: 'ADMIN',
    };

    it('should generate access and refresh tokens', () => {
      const tokens = generateTokenPair(mockUser as IUser);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid JWT tokens', () => {
      const tokens = generateTokenPair(mockUser as IUser);
      
      // Access token should be valid
      const accessDecoded = jwt.verify(tokens.accessToken, JWT_SECRET) as any;
      expect(accessDecoded.id).toBe(mockUser._id!.toString());
      expect(accessDecoded.email).toBe(mockUser.email);
      expect(accessDecoded.role).toBe(mockUser.role);
      
      // Refresh token should be valid
      const refreshDecoded = jwt.verify(tokens.refreshToken, JWT_REFRESH_SECRET) as any;
      expect(refreshDecoded.id).toBe(mockUser._id!.toString());
    });

    it('should generate tokens with correct expiration', () => {
      const tokens = generateTokenPair(mockUser as IUser);
      
      const accessDecoded = jwt.decode(tokens.accessToken) as any;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as any;
      
      // Access token should expire in 1 hour
      const accessExp = accessDecoded.exp - accessDecoded.iat;
      expect(accessExp).toBe(3600); // 1 hour in seconds
      
      // Refresh token should expire in 7 days
      const refreshExp = refreshDecoded.exp - refreshDecoded.iat;
      expect(refreshExp).toBe(604800); // 7 days in seconds
    });

    it('should generate different tokens for different users', () => {
      const user1: Partial<IUser> = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'user1@example.com',
        role: 'ADMIN',
      };
      const user2: Partial<IUser> = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        email: 'user2@example.com',
        role: 'TEKNISYEN',
      };
      
      const tokens1 = generateTokenPair(user1 as IUser);
      const tokens2 = generateTokenPair(user2 as IUser);
      
      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('isMobileClient', () => {
    it('should return true for mobile client header', () => {
      const req = {
        headers: {
          'x-client': 'mobile',
        },
      };
      
      expect(isMobileClient(req)).toBe(true);
    });

    it('should return true for expo client header', () => {
      const req = {
        headers: {
          'x-client': 'expo',
        },
      };
      
      expect(isMobileClient(req)).toBe(true);
    });

    it('should return true for react-native client header', () => {
      const req = {
        headers: {
          'x-client': 'react-native',
        },
      };
      
      expect(isMobileClient(req)).toBe(true);
    });

    it('should return true for x-client-platform header', () => {
      const req = {
        headers: {
          'x-client-platform': 'mobile',
        },
      };
      
      expect(isMobileClient(req)).toBe(true);
    });

    it('should return false for web client', () => {
      const req = {
        headers: {
          'x-client': 'web',
        },
      };
      
      expect(isMobileClient(req)).toBe(false);
    });

    it('should return false when no client header is present', () => {
      const req = {
        headers: {},
      };
      
      expect(isMobileClient(req)).toBe(false);
    });

    it('should handle case-insensitive headers', () => {
      const req1 = {
        headers: {
          'x-client': 'MOBILE',
        },
      };
      const req2 = {
        headers: {
          'x-client': 'Mobile',
        },
      };
      const req3 = {
        headers: {
          'x-client': 'mObIlE',
        },
      };
      
      expect(isMobileClient(req1)).toBe(true);
      expect(isMobileClient(req2)).toBe(true);
      expect(isMobileClient(req3)).toBe(true);
    });

    it('should handle headers with whitespace', () => {
      const req = {
        headers: {
          'x-client': '  mobile  ',
        },
      };
      
      expect(isMobileClient(req)).toBe(true);
    });

    it('should handle missing headers object', () => {
      const req = {};
      
      expect(isMobileClient(req)).toBe(false);
    });
  });
});
