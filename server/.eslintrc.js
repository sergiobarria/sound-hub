module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ['standard-with-typescript', 'eslint-config-prettier'],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ['config/**/*.ts', 'prisma/**/*.ts'], // Ignore config files
    rules: {
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
    },
};
