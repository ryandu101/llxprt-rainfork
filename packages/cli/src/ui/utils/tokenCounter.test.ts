import { Tiktoken } from 'js-tiktoken';
import { countTokens } from './tokenCounter';

vi.mock('js-tiktoken', () => {
  const Tiktoken = vi.fn().mockImplementation(() => ({ 
    encode: vi.fn().mockReturnValue([1, 2, 3, 4, 5]),
  }));
  return { Tiktoken };
});

describe('countTokens', () => {
  it('should return the correct token count for a given model', () => {
    const model = 'gemini-';
    const text = 'This is a test';
    const tokenCount = countTokens(model, text);
    expect(tokenCount).toBe(5);
  });

  it('should return 0 for an empty string', () => {
    const model = 'gemini-';
    const text = '';
    const tokenCount = countTokens(model, text);
    expect(tokenCount).toBe(0);
  });

  it('should return the correct token count for a different model', () => {
    const model = 'gpt-4-';
    const text = 'This is another test';
    const tokenCount = countTokens(model, text);
    expect(tokenCount).toBe(5);
  });
});
