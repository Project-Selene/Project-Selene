declare interface ProjectSeleneGlobal {
    gameReadyCallback: () => void;
    devMod?: {hotreload: () => void, afterMain?: (mod: ModHandler) => void, registerPatches(patches: import('../state').ModPatch[]): Promise<void>, unregisterPatches(patches: import('../state').ModPatch[]): Promise<void> }
    symbol: symbol;
    classes: Record<string | symbol, unknown>;
    functions: Record<string | symbol, (...args: unknown[]) => unknown>;
    consts: Record<string | symbol, unknown>;
    lets: Record<string | symbol, { getter: () => unknown, setter: (value: unknown) => void }>;
    enums: Record<string, Record<string, number>>;
}

declare const __projectSelene: ProjectSeleneGlobal;