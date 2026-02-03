import { loginSchema, registerSchema, changePasswordSchema, updatePasswordSchema } from '../auth';

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
        password: 'password123',
        confirmPassword: 'password123'
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
        password: '123',
        confirmPassword: '123'
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail when passwords do not match', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password456'
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
        newPassword: 'newPass123',
        confirmNewPassword: 'newPass123'
      };
      const result = changePasswordSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should fail when new passwords do not match', () => {
        const invalid = {
            currentPassword: 'oldPass',
            newPassword: 'newPass123',
            confirmNewPassword: 'newPass456'
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
              newPassword: 'newpass'
          };
          const result = updatePasswordSchema.safeParse(valid);
          expect(result.success).toBe(true);
      });
  });
});
