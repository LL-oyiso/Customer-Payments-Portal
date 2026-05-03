const security = require('eslint-plugin-security')

module.exports = [
  {
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
    files: ['src/**/*.js'],
    ignores: ['node_modules/**', 'prisma/**'],
  },
]
