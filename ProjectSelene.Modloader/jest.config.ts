import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/public/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
};

export default config;