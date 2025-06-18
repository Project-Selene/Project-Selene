import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import semver from 'semver';
import { ModDto } from '../moddb/generated/selene-api';
import { selectInstalledMods } from './game.store';
import { filterMods } from './helpers/filter-mods';
import { LoadingState } from './models/loading-state';
import { Mod } from './models/mod';

interface ModStore {
	mods: LoadingState<ModDto[]>;

	search: string;
	dialogOpen: boolean;
}

const initialState: ModStore = {
	mods: {},
	search: '',
	dialogOpen: false,
};

// const modsClient = new ModsClient();

export const loadModsFromDb = createAsyncThunk('loadModsFromDb', async () => {
	// return await modsClient.getMods();
	function exampleMod(id: string): ModDto {
		return {
			name: 'Jetpack',
			description: 'Press space to fly',
			id,
			version: '1.0.0',
			author: 'hi',
			versions: ['1.0.0'],
		};
	}
	return { mods: [exampleMod('1'), exampleMod('2'), exampleMod('3'), exampleMod('4')] };
});

export const modSlice = createSlice({
	name: 'mod',
	initialState,
	reducers: {
		setModsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.dialogOpen = payload;
		},
		searchForMod: (state, { payload }: PayloadAction<string>) => {
			state.search = payload;
		},
	},
	extraReducers(builder) {
		builder.addCase(loadModsFromDb.pending, state => {
			state.mods.loading = true;
		});
		builder.addCase(loadModsFromDb.rejected, state => {
			state.mods.loading = false;
		});
		builder.addCase(loadModsFromDb.fulfilled, (state, { payload }) => {
			state.mods = {
				loading: false,
				data: payload.mods,
			};
		});
	},
	selectors: {
		selectModMap: createSelector(
			(state: ModStore) => state.mods?.data,
			mods => {
				const map: Record<string, ModDto> = {};
				for (const mod of mods ?? []) {
					map[mod.id] = mod;
				}
				return map;
			},
		),
		selectModsSearch: state => state.search,
		selectModsDialogOpen: state => state.dialogOpen,
		selectAvailableModsLoading: state => !!state.mods.loading,
	},
});

export const { setModsOpen, searchForMod } = modSlice.actions;

export const { selectModsSearch, selectModsDialogOpen, selectAvailableModsLoading } = modSlice.selectors;

export const selectUnfilteredMods = createSelector(
	modSlice.selectors.selectModMap,
	selectInstalledMods,
	(modMap, installedMods) => {
		const mods: Mod[] = [];
		const ids = new Set<string>();
		for (const mod of installedMods) {
			const dbMod = modMap[mod.id];
			mods.push({
				id: mod.id,

				isInstalled: true,
				hasUpdate: dbMod && (!mod.version || semver.gt(mod.version, dbMod.version)),

				name: mod.name,
				description: mod.description,
				version: mod.version,

				latestVersion: dbMod?.version,
			});
			ids.add(mod.id);
		}

		for (const mod of Object.values(modMap)) {
			if (ids.has(mod.id)) {
				continue;
			}

			mods.push({
				id: mod.id,

				isInstalled: false,
				hasUpdate: false,

				name: mod.name,
				description: mod.description,
				version: mod.version,

				latestVersion: mod.version,
			});
		}

		return mods;
	},
);
export const selectMods = createSelector(modSlice.selectors.selectModsSearch, selectUnfilteredMods, (search, mods) => {
	return filterMods(mods, search);
});
