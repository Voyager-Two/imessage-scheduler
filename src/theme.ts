'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /* Put your mantine theme override here */
  primaryColor: 'orange',
  colors: {
    orange: [
      '#fff1e2', // 1
      '#ffe2ce', // 2
      '#fbc3a0', // 3
      '#f6a26d', // 4
      '#f28642', // 5
      '#f07527', // 6 - main
      '#f06b17', // 7
      '#d65a0a', // 8
      '#bf4f04', // 9
      '#a74200', // 10
    ],
    dark: [
      '#C1C2C5', // 1
      '#A6A7AB', // 2
      '#909296', // 3
      '#5c5f66', // 4
      '#373A40', // 5
      '#2e2e2e', // 6 - borders, list item bg
      '#1f1f1f', // 7 - btns, etc
      '#222222', // 8 - Main content background
      '#1f1f1f', // 9 - Sidebar background
      '#141517', // 10
    ],
    light: [
      '#FFFFFF', // 1
      '#F5F5F5', // 2
      '#E5E5E5', // 3
      '#D4D4D4', // 4
      '#C4C4C4', // 5
      '#B3B3B3', // 6
      '#A2A2A2', // 7
      '#919191', // 8
      '#808080', // 9
      '#6F6F6F', // 10
    ],
  },
  defaultRadius: 'md',
  white: '#FFFFFF',
  black: '#1f1f1f',

  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});
