import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
        },
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
    // Node.js specific rules
        files: ['**/*.{js,mjs,cjs}'],
        rules: {
            // Best Practices
            'no-console': 'warn',
            'no-process-exit': 'error',
            'require-await': 'error',

            // Node.js and CommonJS
            'callback-return': 'error',
            'global-require': 'error',
            'handle-callback-err': 'error',
            'no-buffer-constructor': 'error',
            'no-mixed-requires': ['error', { grouping: true }],
            'no-new-require': 'error',
            'no-path-concat': 'error',
            'no-sync': 'warn',

            // ES6
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-const': 'error',
            'prefer-arrow-callback': 'error',

            // Stylistic
            indent: ['error', 4],              // changed to 4 spaces
            quotes: ['error', 'single'],       // allow single quotes
            semi: ['error', 'never'],          // disallow semicolons
            'comma-dangle': ['error', 'always-multiline'],

            // Variables
            'no-undef': 'error',
            'no-unused-vars': 'warn',
        },
    },
])
