import fs from 'fs';
import { transform } from './transformer';


describe('Transformer', () => {
	test('it should handle empty', async () => {
		transform('', '');
	});
	test('it should handle the dummy game', async () => {
		const content = await fs.promises.readFile('../ProjectSelene.DummyGame/dist/assets/js/game.compiled.js', 'utf-8');
		const result = transform(content, 'console.log("test")');
		// await fs.promises.writeFile('./testdata/bundle.transformed.mjs', result);
		const expected = await fs.promises.readFile('./testdata/bundle.transformed.mjs', 'utf-8');
		expect(result).toBe(expected);
		console.log(result);
	});
});