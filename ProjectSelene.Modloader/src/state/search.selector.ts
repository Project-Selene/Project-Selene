import { createSelector } from '@reduxjs/toolkit';
import { ModInfo } from './models/mod';
import { RootState, selectAvailableMod, selectAvailableModIds, selectInstalledMod, selectInstalledModIds, selectSearchString } from './state.reducer';

const enum FilterLevel {
	StartsWithName = 0,
	ContainsName = 1,
	StartsWithDescription = 2,
	ContainsDescription = 3,
	None,
}

function filter(ids: string[], search: string, state: RootState, getMod: (state: RootState, id: string) => ModInfo | undefined) {
	if (!search) {
		return ids;
	}
	const searchWithoutEmpty = search.toLowerCase().replace(/\s+/g, ' ');
	const searchParts = search.split(/\s+/);
	return ids.map(id => {
		const result = { level: FilterLevel.None, id, name: '' };

		const mod = getMod(state, id);
		if (!mod) {
			return result;
		}

		result.name = mod.name;

		if (mod.name.toLowerCase().replace(/\s+/g, ' ').startsWith(searchWithoutEmpty)) {
			if (result.level > FilterLevel.StartsWithName) {
				result.level = FilterLevel.StartsWithName;
			}
		}
		if (mod.description.toLowerCase().replace(/\s+/g, ' ').startsWith(searchWithoutEmpty)) {
			if (result.level > FilterLevel.StartsWithDescription) {
				result.level = FilterLevel.StartsWithDescription;
			}
		}

		for (const part of searchParts) {
			if (mod.name.toLowerCase().includes(part.toLowerCase())) {
				if (result.level > FilterLevel.ContainsName) {
					result.level = FilterLevel.ContainsName;
				}
			}
			if (mod.description.toLowerCase().includes(part.toLowerCase())) {
				if (result.level > FilterLevel.ContainsDescription) {
					result.level = FilterLevel.ContainsDescription;
				}
			}
		}

		return result;
	})
		.filter(x => x.level !== FilterLevel.None)
		.sort((a, b) => {
			const levelDiff = a.level - b.level;
			if (levelDiff !== 0) {
				return levelDiff;
			}
			return a.name.localeCompare(b.name);
		}).map(x => x.id);
}

export const selectFilteredAvailableModIds = createSelector(
	selectAvailableModIds,
	selectSearchString,
	(state: RootState) => state,
	(ids, search, state) => filter(ids, search, state, selectAvailableMod),
);

export const selectFilteredInstalledModIds = createSelector(
	selectInstalledModIds,
	selectSearchString,
	(state: RootState) => state,
	(ids, search, state) => filter(ids, search, state, (s, f) => selectInstalledMod(s, f)?.currentInfo),
);