import { loginSchema, registerSchema, changePasswordSchema, updatePasswordSchema } from '@/lib/validations/auth';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login input', () => {
      const valid = { email: 'test@example.com', password: 'password123' };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalid = { email: 'not-an-email', password: 'password123' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should fail with empty password', () => {
      const invalid = { email: 'test@example.com', password: '' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration input', () => {
      const valid = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should fail short name', () => {
      const invalid = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail short password', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('should fail password without uppercase', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123!',
        confirmPassword: 'password123!'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one uppercase letter');
      }
    });

    it('should fail password without lowercase', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        password: 'PASSWORD123!',
        confirmPassword: 'PASSWORD123!'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one lowercase letter');
      }
    });

    it('should fail password without symbol', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one symbol');
      }
    });

    it('should fail when passwords do not match', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password456!'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
         // The refinement error might be slightly different in structure or path
         // usually path is ['confirmPassword']
         expect(result.error.issues.some(i => i.path.includes('confirmPassword'))).toBe(true);
         expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid password change', () => {
      const valid = {
        currentPassword: 'oldPass',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!'
      };
      const result = changePasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should fail when new passwords do not match', () => {
        const invalid = {
            currentPassword: 'oldPass',
            newPassword: 'NewPassword123!',
            confirmNewPassword: 'NewPassword456!'
        };
        const result = changePasswordSchema.safeParse(invalid);
        expect(result.success).toBe(false);
         if (!result.success) {
             expect(result.error.issues[0].message).toBe("Passwords don't match");
         }
    });
  });

  describe('updatePasswordSchema', () => {
      it('should validate valid update payload', () => {
          const valid = {
              currentPassword: 'curr',
              newPassword: 'NewPassword123!'
          };
          const result = updatePasswordSchema.safeParse(valid);
          expect(result.success).toBe(true);
      });

      it('should fail invalid update payload', () => {
          const invalid = {
              currentPassword: 'curr',
              newPassword: 'plain'
          };
          const result = updatePasswordSchema.safeParse(invalid);
          expect(result.success).toBe(false);
      });
  });
});
