'use client';

import { forwardRef } from 'react';
import type { IconProps } from '@iconify/react';
import { disableCache, Icon } from '@iconify/react';
import clsx from 'clsx';

// ----------------------------------------------------------------------

export type IconifyProps = {
  className?: string;
  width?: number;
  sx?: object;
} & IconProps;

export const Iconify = forwardRef<SVGSVGElement, IconifyProps>((props, ref) => {
  const { className, width = 20, sx, ...other } = props;

  const baseStyles = {
    width,
    height: width,
    flexShrink: 0,
    display: 'inline-flex',
  };

  const combinedStyles = Array.isArray(sx) ? [baseStyles, ...sx] : [baseStyles, sx];

  return (
    <Icon
      ref={ref}
      className={clsx('iconify__root', className)}
      style={combinedStyles.reduce((acc, style) => ({ ...acc, ...style }), {})}
      {...other}
    />
  );
});

// https://iconify.design/docs/iconify-icon/disable-cache.html
disableCache('local');
