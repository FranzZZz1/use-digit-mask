/// <reference types="vite-plugin-svgr/client" />

// Usage: import Logo from './logo.svg?react'
// Then:  <Logo className="icon" />

declare module '*.svg?react' {
  import type * as React from 'react';
  const component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default component;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
