import path from 'path';

const testPathForConsistencyCheck = 'some/example.test.ts';

const prefix = './tests/testdata/snapshots/';

function resolveSnapshotPath(testPath: string, snapshotExtension: string) {
	return prefix + path.relative('.', testPath).replace(/\\/g, '/') + snapshotExtension;
}

function resolveTestPath(snapshotFilePath: string, snapshotExtension: string) {
	return snapshotFilePath.substring(prefix.length, snapshotFilePath.length - snapshotExtension.length);
}

export default {
	testPathForConsistencyCheck,
	resolveSnapshotPath,
	resolveTestPath,
};
