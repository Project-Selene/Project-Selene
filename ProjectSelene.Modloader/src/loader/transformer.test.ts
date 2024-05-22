import fs from 'fs';
import { transform } from './transformer';


describe('Transformer', () => {
	test('it should handle empty', async () => {
		expect(transform('', '')).toMatchSnapshot();
	});
	test('it should handle the dummy game', async () => {
		const content = await fs.promises.readFile('../ProjectSelene.DummyGame/dist/assets/js/game.compiled.js', 'utf-8');
		const result = transform(content, 'console.log("test")');
		expect(result.replace(/(\r\n|\n\r|\r)/g, '\n')).toMatchSnapshot();
	});
});