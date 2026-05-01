import fs from 'fs';
import { describe, expect, it } from 'vitest';
import { transform } from './transformer';

describe('Transformer', () => {
	it('should handle empty', async () => {
		expect(transform('', '')).toMatchSnapshot();
	});
	it('	should handle the dummy game', async () => {
		const content = await fs.promises.readFile('../ProjectSelene.DummyGame/dist/assets/js/game.compiled.js', 'utf-8');
		const result = transform(content, 'console.log("test")');
		expect(result.replace(/(\r\n|\n\r|\r)/g, '\n')).toMatchSnapshot();
	});
});
