export abstract class Patcher {
	protected readonly patches = new Map<string, string[]>();

	constructor(
        protected readonly readFile: (path: string) => Promise<ReadableStream<Uint8Array> | undefined>,
	) { }

	protected async streamToUint8Array(readableStream: ReadableStream<Uint8Array>) {
		const reader = readableStream.getReader();
		const chunks: Uint8Array[] = [];
		try {
			while (true) {
				const { done, value } = await reader.read();
          
				if (done) {
					break;
				}
          
				chunks.push(value);
			}
		} finally {
			reader.releaseLock();
		}
      
      
      
		const concatenatedChunks = new Uint8Array(
			chunks.reduce((acc, chunk) => acc + chunk.length, 0),
		);
      
		let offset = 0;
		for (const chunk of chunks) {
			concatenatedChunks.set(chunk, offset);
			offset += chunk.length;
		}
      
		return concatenatedChunks;
	}

	protected async readFileToUint8Array(path: string): Promise<Uint8Array> {
		const readableStream = await this.readFile(path);
		if (!readableStream) {
			throw new Error('File not found: ' + path);
		}

		return this.streamToUint8Array(readableStream);
	}

	registerPatches(patches: {
        target: string,
        source: string,
    }[]) {
		for (const { target, source } of patches) {
			const existing = this.patches.get(target);
			if (existing) {
				if (existing.includes(source)) {
					existing.splice(existing.indexOf(source), 1);
				}
				existing.push(source);
			} else {
				this.patches.set(target, [source]);
			}
		}
	}

	unregisterPatches(patches: {
        target: string,
        source: string,
    }[]) {
		for (const { target, source } of patches) {
			const existing = this.patches.get(target);
			if (existing) {
				const index = existing.indexOf(source);
				if (index >= 0) {
					existing.splice(index, 1);
				}
			}
		}
	}

	hasPatch(file: string): boolean {
		const patches = this.patches.get(file);
		return !!patches && patches.length > 0;
	}

    abstract patchFile(file: string, input: ReadableStream<Uint8Array>): ReadableStream<Uint8Array>;
}