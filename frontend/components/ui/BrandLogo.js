'use client';

import { useState } from 'react';

export default function BrandLogo({ alt = 'Logo', className = '' }) {
  const [src, setSrc] = useState('/branding/logo.png');

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (src !== '/branding/logo.svg') {
          setSrc('/branding/logo.svg');
        }
      }}
    />
  );
}
