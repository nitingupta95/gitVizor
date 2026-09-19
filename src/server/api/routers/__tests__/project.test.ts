/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectRouter } from '../project';
import { db } from '@/server/db';
import * as clerk from '@clerk/nextjs/server';
import { createCallerFactory } from '../../trpc';
import * as githubLoader from '@/lib/github/loader';

vi.mock('@/server/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    project: {
      create: vi.fn(),
      update: vi.fn(),
    }
  }
}));

vi.mock('@/lib/github/loader', () => ({
  checkCredits: vi.fn(),
  indexGithubRepo: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/lib/github', () => ({
  pollCommits: vi.fn().mockResolvedValue(true)
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('Project Router - Credit Deduction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createCaller = createCallerFactory(projectRouter);

  it('throws an error if user does not have enough credits', async () => {
    vi.mocked(clerk.auth).mockResolvedValue({ userId: 'test_user_id' } as any);
    
    // User has 10 credits
    vi.mocked(db.user.findUnique).mockResolvedValue({ credits: 10 } as any);
    
    // Project needs 15 credits
    vi.mocked(githubLoader.checkCredits).mockResolvedValue(15);
    
    const caller = createCaller({ db: db as any, headers: new Headers() });
    
    await expect(caller.createProject({
      name: 'Test Project',
      githubUrl: 'https://github.com/test/repo',
      githubToken: 'test-token'
    })).rejects.toThrow('Not enough credits to create this project. Please upgrade your plan.');
  });

  it('creates project and deducts credits when user has enough', async () => {
    vi.mocked(clerk.auth).mockResolvedValue({ userId: 'test_user_id' } as any);
    
    // User has 20 credits
    vi.mocked(db.user.findUnique).mockResolvedValue({ credits: 20 } as any);
    
    // Project needs 15 credits
    vi.mocked(githubLoader.checkCredits).mockResolvedValue(15);
    
    vi.mocked(db.project.create).mockResolvedValue({ id: 'proj_123' } as any);
    vi.mocked(db.user.update).mockResolvedValue(true as any);

    const caller = createCaller({ db: db as any, headers: new Headers() });
    
    const result = await caller.createProject({
      name: 'Test Project',
      githubUrl: 'https://github.com/test/repo',
      githubToken: 'test-token'
    });

    expect(result).toBeDefined();
    
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'test_user_id' },
      data: { credits: 5 } // 20 - 15 = 5
    });
  });
});
