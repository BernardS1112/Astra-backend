import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'],
}

export default config
