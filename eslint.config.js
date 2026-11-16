import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
    {
        ignores: ['node_modules/', 'assets/'],
    },
    js.configs.recommended,
    prettierRecommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
]
