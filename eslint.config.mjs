import wizardryConfig from 'eslint-config-wizardry';
import tseslint from 'typescript-eslint';

const config = [
  ...tseslint.config(...wizardryConfig),
  {
    ignores: ['dist/'],
    rules: {
      '@typescript-eslint/dot-notation': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effects
            ['^\\u0000'],
            // React, then other external packages
            ['^react', '^@?\\w'],
            // Parent imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Sibling imports, then current dir
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
    },
  },
];

export default config;
