import '@testing-library/jest-dom'

// Ensure auth code has a stable secret in unit tests.
process.env.JWT_SECRET ||= 'test-jwt-secret';
