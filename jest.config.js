module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: for global setup
  moduleNameMapper: {
    // Handle module aliases (if you have them in jsconfig.json or tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1', // Added for utils
    // Mock static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle pdfjs-dist specifically for Jest
    'pdfjs-dist/build/pdf': '<rootDir>/__mocks__/pdfjs-dist.js',
    'pdfjs-dist/build/pdf.worker.entry': '<rootDir>/__mocks__/pdfjs.worker.entry.js',
  },
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
