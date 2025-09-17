import fs from 'fs';

await fs.promises.rm('./tests/testdata/screenshots/', {
	recursive: true,
	force: true,
});
await fs.promises.rm('./tests/testdata/snapshots/', {
	recursive: true,
	force: true,
});
