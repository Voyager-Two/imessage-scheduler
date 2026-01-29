import '@mantine/core/styles.css';
import './globals.css';

import React from 'react';
import { ReduxProvider } from '@app/common/providers/redux-provider';
import { theme } from '@app/theme';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';

export const metadata = {
  title: 'Scheduler',
  description: 'Schedule and manage message deliveries with a beautiful interface',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        {/* Favicon configuration */}
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#F07121" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <ReduxProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            {children}
          </MantineProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
