#!/usr/bin/env node

import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json') as unknown as string);

pkg['project-selene'] ??= {};
pkg['project-selene'].id = crypto.randomUUID();

fs.writeFileSync('./package.json', JSON.stringify(pkg, undefined, 2));