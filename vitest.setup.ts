import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ ...data, ...options })),
  },
  NextRequest: vi.fn(),
}));
