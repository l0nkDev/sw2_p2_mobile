module.exports = {
  ignorePatterns: ['scripts/*', '*.js'],
  extends: ['airbnb', 'airbnb-typescript', 'expo', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react-native/no-inline-styles': 'off',
    'react/react-in-jsx-scope': 'off', // Not needed in modern React/Expo
    'import/prefer-default-export': 'off',
    'react/style-prop-object': 'off', // Conflicts with Expo StatusBar
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
  },
};
