interface ModPatch {
    target: string;
    type: 'json' | 'raw';
}

declare const __projectSelene : {
    symbol: symbol;
    devMod?: {hotreload: () => void, afterMain?: (mod: import('./mod.js').Mod) => void, watchers?: Map<string, () => void>, registerPatches(patches: ModPatch[]): Promise<void>, unregisterPatches(patches: ModPatch[]): Promise<void> };
    classes: Record<string | symbol, unknown>;
    consts: Record<string | symbol, unknown>;
    lets: Record<string | symbol, { getter: () => unknown, setter: (value: unknown) => void }>;
    enums: Record<string, Record<string, number>>;
};