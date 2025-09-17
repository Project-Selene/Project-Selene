import { Mod } from '../models/mod';

const enum FilterLevel {
	StartsWithName = 0,
	ContainsName = 1,
	StartsWithDescription = 2,
	ContainsDescription = 3,
	None,
}

export function filterMods(mods: Mod[], search: string) {
	if (!search) {
		return mods;
	}
	const searchWithoutEmpty = search.toLowerCase().replace(/\s+/g, ' ');
	const searchParts = search.split(/\s+/);
	return mods
		.map(mod => {
			const result = { level: FilterLevel.None, mod };
			const name = mod.name.toLowerCase();
			const description = mod.description.toLowerCase();
			if (name.replace(/\s+/g, ' ').startsWith(searchWithoutEmpty)) {
				if (result.level > FilterLevel.StartsWithName) {
					result.level = FilterLevel.StartsWithName;
				}
			}
			if (description.replace(/\s+/g, ' ').startsWith(searchWithoutEmpty)) {
				if (result.level > FilterLevel.StartsWithDescription) {
					result.level = FilterLevel.StartsWithDescription;
				}
			}

			for (const part of searchParts) {
				if (name.includes(part.toLowerCase())) {
					if (result.level > FilterLevel.ContainsName) {
						result.level = FilterLevel.ContainsName;
					}
				}
				if (description.includes(part.toLowerCase())) {
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
			return a.mod.name.localeCompare(b.mod.name);
		})
		.map(x => x.mod);
}
