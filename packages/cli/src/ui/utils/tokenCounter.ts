
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getEncoding, Tiktoken, TiktokenEncoding } from 'js-tiktoken';

// A map of model prefixes to their encodings.
const ENCODING_MAP: Record<string, TiktokenEncoding> = {
  'gemini-': 'cl100k_base',
  'gpt-4-': 'cl100k_base',
  'gpt-3.5-turbo': 'cl100k_base',
};

// A cache for the tokenizers, so we don't have to re-initialize them.
const TOKENIZER_CACHE: Record<string, Tiktoken> = {};

/**
 * Gets the tokenizer for a given model.
 *
 * @param model The model to get the tokenizer for.
 * @returns The tokenizer for the model.
 */
function getTokenizer(model: string): Tiktoken | undefined {
  if (TOKENIZER_CACHE[model]) {
    return TOKENIZER_CACHE[model];
  }

  for (const prefix in ENCODING_MAP) {
    if (model.startsWith(prefix)) {
      const encodingName = ENCODING_MAP[prefix];
      if (encodingName) {
        const tokenizer = getEncoding(encodingName);
        TOKENIZER_CACHE[model] = tokenizer;
        return tokenizer;
      }
    }
  }

  return undefined;
}

/**
 * Counts the number of tokens in a given text for a given model.
 *
 * @param model The model to count the tokens for.
 * @param text The text to count the tokens of.
 * @returns The number of tokens in the text.
 */
export function countTokens(model: string, text: string): number {
  if (!text) {
    return 0;
  }
  const tokenizer = getTokenizer(model);
  if (!tokenizer) {
    // Return a rough estimate of the number of tokens.
    return Math.round(text.length / 4);
  }
  return tokenizer.encode(text).length;
}
