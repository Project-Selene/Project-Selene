import * as idb from 'idb-keyval';

export class Loader {
	private isOpen = false;

	public canOpen(): boolean {
		idb.get('gameHandle');
		return !this.isOpen;
	}
    
	public needsOpen(): boolean {
		return !this.isOpen;
	}

	public isLocal(): boolean {
		return !!window?.process?.versions?.nw;
	}

	public async open(): Promise<void> {
		this.isOpen = true;
	}

	public install(): void {
        
	}
}

export const loader = new Loader();