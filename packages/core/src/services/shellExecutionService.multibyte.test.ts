/**
 * @license
 * Copyright 2025 Vybestack LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
const mockSpawn = vi.hoisted(() => vi.fn());
vi.mock('child_process', () => ({
  spawn: mockSpawn,
}));

import EventEmitter from 'events';
import { Readable } from 'stream';
import { type ChildProcess } from 'child_process';
import {
  ShellExecutionService,
  ShellOutputEvent,
} from './shellExecutionService.js';

const mockIsBinary = vi.hoisted(() => vi.fn());
vi.mock('../utils/textUtils.js', () => ({
  isBinary: mockIsBinary,
}));

const mockPlatform = vi.hoisted(() => vi.fn());
vi.mock('os', () => ({
  default: {
    platform: mockPlatform,
  },
  platform: mockPlatform,
}));

describe('ShellExecutionService multibyte', () => {
  let mockChildProcess: EventEmitter & Partial<ChildProcess>;
  let onOutputEventMock: Mock<(event: ShellOutputEvent) => void>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockIsBinary.mockReturnValue(false);
    mockPlatform.mockReturnValue('darwin');

    onOutputEventMock = vi.fn();

    mockChildProcess = new EventEmitter() as EventEmitter &
      Partial<ChildProcess>;
    mockChildProcess.stdout = new EventEmitter() as Readable;
    mockChildProcess.stderr = new EventEmitter() as Readable;

    Object.defineProperty(mockChildProcess, 'pid', {
      value: 24680,
      configurable: true,
    });

    mockSpawn.mockReturnValue(mockChildProcess);
  });

  const simulate = async (
    command: string,
    simulation: (cp: typeof mockChildProcess) => void,
  ) => {
    const ac = new AbortController();
    const handle = ShellExecutionService.execute(
      command,
      '/tmp',
      onOutputEventMock,
      ac.signal,
    );
    await new Promise((r) => setImmediate(r));
    simulation(mockChildProcess);
    return handle.result;
  };

  it('decodes UTF-8 multibyte split across chunks in the same stream', async () => {
    const jp = Buffer.from('ありがとう 世界', 'utf-8');

    const resultPromise = simulate('echo "x" | cat', (cp) => {
      // Split within stdout only across arbitrary chunk boundaries
      cp.stdout?.emit('data', jp.slice(0, 3));
      cp.stdout?.emit('data', jp.slice(3, 6));
      cp.stdout?.emit('data', jp.slice(6));
      cp.emit('exit', 0, null);
    });

    const result = await resultPromise;
    expect(result.stdout).toContain('ありがとう 世界');
  });

  it('handles interleaved stdout/stderr without splitting code points across streams', async () => {
    const hello = Buffer.from('ありがとう ', 'utf-8');
    const world = Buffer.from('世界', 'utf-8');

    const resultPromise = simulate('echo "x" | cat', (cp) => {
      cp.stdout?.emit('data', hello);
      cp.stderr?.emit('data', world);
      cp.emit('exit', 0, null);
    });

    const result = await resultPromise;
    expect((result.stdout + result.stderr).includes('ありがとう 世界')).toBe(
      true,
    );
  });
});
