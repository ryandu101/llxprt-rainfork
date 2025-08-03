/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';

export const TokenBurn: React.FC<{ totalTokens: number }> = ({ totalTokens }) => {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      <Text>
        <Text color={Colors.Foreground}>Token Burn:🔥</Text>
        <Text color={Colors.AccentRed} bold>
          {totalTokens.toLocaleString()}
        </Text>
        <Text color={Colors.Foreground}>🔥</Text>
      </Text>
    </Box>
  );
};