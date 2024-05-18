import fs from 'fs';
import { program } from 'playwright/lib/program';

await fs.promises.rm('./tests/testdata/screenshots/', { recursive: true, force: true });

program.parse(['npx', 'playwright', 'test', '--update-snapshots']);