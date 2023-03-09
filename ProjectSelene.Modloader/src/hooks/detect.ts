export function useJSAvailable() {
	return navigator.userAgent !== 'ReactSnap';
}

export function useIsLocal() {
	return !!window?.process?.versions?.nw;
}

export function useSupportsOpenFolder() {
	return 'showDirectoryPicker' in window;
}