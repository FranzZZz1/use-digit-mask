import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

const config = defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/excessive-slicing': 'off',
      'fsd/segments-by-purpose': 'off',
    },
  },
  {
    files: ['./src/demo/shared/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },
]);

export default config;
