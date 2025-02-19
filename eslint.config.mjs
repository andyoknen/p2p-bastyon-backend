import antfu from '@antfu/eslint-config'

export default antfu(
  {
    rules: {
      'no-fallthrough': 'off',
      'node/prefer-global/process': 'off',
      'no-console': 'off',
    }
  }
)
