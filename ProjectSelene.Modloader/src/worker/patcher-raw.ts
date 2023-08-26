import { Patcher } from './patcher';

export class PatcherRaw extends Patcher {
	constructor(
		readFile: (path: string) => Promise<ReadableStream<Uint8Array> | undefined>,
	) { 
		super(readFile);
	}

	patchFile(file: string, input: ReadableStream<Uint8Array> | null): ReadableStream<Uint8Array> {
		const patches = this.patches.get(file);
		if (!patches || patches.length === 0) {
			if (!input) {
				//If you run into this error make sure to always check hasPatch before calling patchFile
				throw new Error('Tried to use raw patch with no patch or input file.');
			}
			return input;
		}

		const transformStream = new TransformStream();
		this.readFile(patches[patches.length - 1])
			.then(result => {
				if (result) {
					result.pipeTo(transformStream.writable);
				} else {
					transformStream.writable.getWriter().close();
				}
			})
			.catch(() => console.error('Failed to read raw patch file'));

		return transformStream.readable;
	}
}