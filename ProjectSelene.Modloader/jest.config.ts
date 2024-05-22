import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/public/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
	snapshotResolver: './tests/snapshot-resolver.ts',
};

export default config;