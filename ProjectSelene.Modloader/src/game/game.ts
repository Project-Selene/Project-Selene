export class Game {
	public readonly isInGame = !!window.process?.versions?.nw;
	public readonly isInBrowserSupported = ('showDirectoryPicker' in window);
	public readonly isInstallInBrowserSupported = ('showDirectoryPicker' in window);
}