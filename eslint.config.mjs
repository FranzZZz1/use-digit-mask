import wizardryConfig from 'eslint-config-wizardry';
import tseslint from 'typescript-eslint';

const config = [
  ...tseslint.config(...wizardryConfig),
  {
    ignores: ['dist/', 'dist-demo/'],
    rules: {
      '@typescript-eslint/dot-notation': 'off',
      // eslint-config-wizardry bundles its own @typescript-eslint version that
      // passes undefined options to the base eslint no-unused-expressions rule,
      // causing a crash. Override with explicit options to fix the conflict.
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],
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
  // Demo is a reference implementation, not a production component.
  // Relax rules that would require either native-element rewrites or verbose
  // default-props boilerplate on every demo component.
  {
    files: ['src/demo/**/*.{ts,tsx}'],
    rules: {
      'react/require-default-props': 'off',
      'jsx-a11y/prefer-tag-over-role': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },
];

export default config;
