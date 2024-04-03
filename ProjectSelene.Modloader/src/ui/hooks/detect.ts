export function useJSAvailable() {
	return document.visibilityState as string !== 'prerender';
}

export function useIsLocal() {
	return !!window?.process?.versions?.nw;
}

export function useSupportsOpenFolder() {
	return 'showDirectoryPicker' in window;
}