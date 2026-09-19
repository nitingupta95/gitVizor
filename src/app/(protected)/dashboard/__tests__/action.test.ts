/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askQuestion } from '../action';
import { db } from '@/server/db';
import * as gemini from '@/lib/ai';
import * as aiSdk from 'ai';

vi.mock('@/server/db', () => ({
  db: {
    $queryRaw: vi.fn(),
  }
}));

vi.mock('@/lib/ai', () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock('@ai-sdk/rsc', () => ({
  createStreamableValue: vi.fn(() => ({
    update: vi.fn(),
    done: vi.fn(),
    value: 'mock_stream_value'
  }))
}));

vi.mock('ai', () => ({
  streamText: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn())
}));

describe('askQuestion Action (RAG)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs query and context correctly', async () => {
    vi.mocked(gemini.generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3]);
    
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { fileName: 'index.ts', sourceCode: 'console.log("hello")', summary: 'main file' }
    ] as any);

    // Mock streamText
    const mockTextStream = {
      async *[Symbol.asyncIterator]() {
        yield 'Answer ';
        yield 'part 2';
      }
    };
    vi.mocked(aiSdk.streamText).mockResolvedValue({
      textStream: mockTextStream
    } as any);

    const result = await askQuestion('How does it work?', 'proj_123');
    
    expect(gemini.generateEmbedding).toHaveBeenCalledWith('How does it work?');
    expect(db.$queryRaw).toHaveBeenCalled();
    
    // Wait for the async IIFE inside askQuestion to finish
    await new Promise(process.nextTick);

    expect(aiSdk.streamText).toHaveBeenCalled();
    const streamCallArgs = vi.mocked(aiSdk.streamText).mock.calls[0][0];
    
    // The prompt should contain the context
    expect(streamCallArgs.prompt).toContain('source: index.ts');
    expect(streamCallArgs.prompt).toContain('console.log("hello")');
    expect(streamCallArgs.prompt).toContain('How does it work?');
    
    expect(result.filesReferences).toHaveLength(1);
    expect(result.output).toBe('mock_stream_value');
  });
});
