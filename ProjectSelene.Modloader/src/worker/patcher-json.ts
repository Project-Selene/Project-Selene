import patcher from 'fast-json-patch';
import { Patcher } from './patcher';

export class PatcherJSON extends Patcher {
	private readonly textEncoder = new TextEncoder();
	private readonly textDecoder = new TextDecoder();
	private readonly decode =
		'Buffer' in globalThis
			? (buffer: Uint8Array) => JSON.parse(Buffer.from(buffer) as unknown as string)
			: (buffer: Uint8Array) => JSON.parse(this.textDecoder.decode(buffer));

	constructor(readFile: (path: string) => Promise<ReadableStream<Uint8Array> | undefined>) {
		super(readFile);
	}

	patchFile(file: string, input: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
		const patches = this.patches.get(file);
		if (!patches || patches.length === 0) {
			return input;
		}

		const transformStream = new TransformStream();

		Promise.all([
			this.streamToUint8Array(input).then(a => this.decode(a)),
			Promise.all(patches.map(p => this.readFileToUint8Array(p).then(a => this.decode(a)))),
		])
			.then(([original, patches]) => this.applyJSONPatches(transformStream.writable, original, patches))
			.catch(err => {
				console.error('Could not patch file', file, err);
				input.pipeTo(transformStream.writable);
			});

		return transformStream.readable;
	}

	private applyJSONPatches(output: WritableStream<Uint8Array>, original: unknown, patches: unknown[]) {
		for (const patch of patches) {
			this.applyJSONPatch(original, patch);
		}
		const writer = output.getWriter();
		writer.write(this.textEncoder.encode(JSON.stringify(original)));
		writer.close();
	}

	private applyJSONPatch(original: unknown, patch: unknown) {
		if (!(patch instanceof Array)) {
			throw new Error('JSON patch is not an array');
		}
		patcher.applyPatch(original, patch, true, true, false);
	}
}
