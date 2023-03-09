import fs from 'fs';
import { Transformer } from './transformer';


describe('Transformer', () => {
	test('it should handle empty', async () => {
		const transformer = new Transformer(); 
		transformer.transform('');
	});
	test('it should handle the dummy game', async () => {
		const content = await fs.promises.readFile('../ProjectSelene.DummyGame/dist/assets/js/game.compiled.js', 'utf-8');
		const transformer = new Transformer(); 
		const result = transformer.transform(content);
		// await fs.promises.writeFile('./testdata/bundle.transformed.js', result);
		const expected = await fs.promises.readFile('./testdata/bundle.transformed.js', 'utf-8');
		expect(result).toBe(expected);
		console.log(result);
	});
});