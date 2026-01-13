/**
 * Validation Utility Tests
 */

import {
  validateInput,
  validateRequest,
  sanitizeHTML,
  sanitizeSQL,
  validateFile,
  isValidEmail,
  isStrongPassword,
  isValidPhoneNumber,
  userSchema,
  projectSchema,
  contactFormSchema,
  equipmentSchema,
} from '@/utils/validation';

describe('Validation Utility', () => {
  describe('validateInput', () => {
    it('should validate correct user data', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user' as const,
      };

      const result = await validateInput(userSchema, validUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validUser);
    });

    it('should reject invalid email', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!',
        role: 'user' as const,
      };

      const result = await validateInput(userSchema, invalidUser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should reject weak password', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        role: 'user' as const,
      };

      const result = await validateInput(userSchema, invalidUser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('password');
    });

    it('should validate project data', async () => {
      const validProject = {
        title: 'Test Project',
        description: 'This is a test project description',
        startDate: new Date(),
        status: 'active' as const,
      };

      const result = await validateInput(projectSchema, validProject);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate contact form data', async () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with enough characters',
      };

      const result = await validateInput(contactFormSchema, validContact);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validContact);
    });

    it('should reject short message', async () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'short',
      };

      const result = await validateInput(contactFormSchema, invalidContact);

      expect(result.success).toBe(false);
      expect(result.error).toContain('message');
    });
  });

  describe('sanitizeHTML', () => {
    it('should escape HTML characters', () => {
      const html = '<script>alert("xss")</script>';
      const sanitized = sanitizeHTML(html);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should escape quotes', () => {
      const html = 'Test "quotes" and \'single quotes\'';
      const sanitized = sanitizeHTML(html);

      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&#039;');
    });

    it('should handle empty string', () => {
      expect(sanitizeHTML('')).toBe('');
    });
  });

  describe('sanitizeSQL', () => {
    it('should escape SQL special characters', () => {
      const sql = "SELECT * FROM users WHERE name = 'John'";
      const sanitized = sanitizeSQL(sql);

      expect(sanitized).toContain("''");
    });

    it('should escape backslash', () => {
      const sql = 'test\\path';
      const sanitized = sanitizeSQL(sql);

      expect(sanitized).toContain('\\\\');
    });

    it('should escape LIKE wildcards', () => {
      const sql = 'test%value_';
      const sanitized = sanitizeSQL(sql);

      expect(sanitized).toContain('\\%');
      expect(sanitized).toContain('\\_');
    });

    it('should handle empty string', () => {
      expect(sanitizeSQL('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeSQL(null as any)).toBe('');
      expect(sanitizeSQL(undefined as any)).toBe('');
    });
  });

  describe('validateFile', () => {
    it('should validate file size', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = validateFile(file, { maxSize: 2 });

      expect(result.success).toBe(true);
    });

    it('should reject oversized file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB

      const result = validateFile(file, { maxSize: 2 });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('boyutu'));
    });

    it('should validate file type', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const result = validateFile(file, { allowedTypes: ['image/jpeg', 'image/png'] });

      expect(result.success).toBe(true);
    });

    it('should reject disallowed file type', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const result = validateFile(file, { allowedTypes: ['image/jpeg', 'image/png'] });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('tipi'));
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong password', () => {
      expect(isStrongPassword('Password123!')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject weak password', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('PASSWORD123')).toBe(false);
      expect(isStrongPassword('Password123')).toBe(false); // No special char
      expect(isStrongPassword('Password!')).toBe(false); // No number
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate Turkish phone numbers', () => {
      expect(isValidPhoneNumber('05551234567')).toBe(true);
      expect(isValidPhoneNumber('+905551234567')).toBe(true);
      expect(isValidPhoneNumber('5551234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(false);
      expect(isValidPhoneNumber('0555123456')).toBe(false); // Too short
      expect(isValidPhoneNumber('invalid')).toBe(false);
    });

    it('should handle spaces in phone number', () => {
      expect(isValidPhoneNumber('0555 123 45 67')).toBe(true);
      expect(isValidPhoneNumber('+90 555 123 45 67')).toBe(true);
    });
  });
});

