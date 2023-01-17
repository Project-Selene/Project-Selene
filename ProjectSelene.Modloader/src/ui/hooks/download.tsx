import { useCallback } from 'react';

export function useDownloadLoader() {
	return useCallback(() => {
		window.open('https://github.com/CCDirectLink/CCLoader/archive/refs/heads/master.zip', '_blank')?.focus();
	}, []);
}