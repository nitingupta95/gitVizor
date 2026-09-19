/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { db } from '@/server/db';
import * as clerk from '@clerk/nextjs/server';

vi.mock('@/server/db', () => ({
  db: {
    $connect: vi.fn(),
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    stripeTransaction: {
      create: vi.fn(),
    }
  }
}));

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
}));

// We have to mock Stripe correctly
const mockConstructEvent = vi.fn();
vi.mock('stripe', () => {
  const StripeMock = vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    }
  }));
  return { default: StripeMock };
});

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'test_secret';
  });

  it('rejects invalid signature', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'body',
      headers: {
        'stripe-signature': 'invalid_sig'
      }
    });

    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature verification');
  });

  it('increments user credits on checkout.session.completed', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'body',
      headers: {
        'stripe-signature': 'valid_sig'
      }
    });

    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'user_123',
          metadata: {
            credits: '100'
          }
        }
      }
    } as any);

    vi.mocked(clerk.clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          emailAddresses: [{ emailAddress: 'test@example.com' }]
        })
      }
    } as any);

    vi.mocked(db.$transaction).mockResolvedValue(true as any);

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    expect(db.$transaction).toHaveBeenCalled();
  });
});
