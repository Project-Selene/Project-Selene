import { Filesystem } from '../filesystem';

export class Game {
	private readonly domParser = new DOMParser();

	constructor(
        private readonly fs: Filesystem,
	) {
        
	}

	async start() {
		// const entry = await this.fs.entrypoint();
		// const element = this.domParser.parseFromString(entry, 'text/html');
		// document.replaceChild(element.children[0], document.documentElement);
	}
}